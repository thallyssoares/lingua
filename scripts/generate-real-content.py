import json, re, concurrent.futures
from pathlib import Path
from openai import OpenAI

ROOT=Path(__file__).resolve().parents[1]
seed=json.loads((ROOT/'scripts/batch1-seed.json').read_text())
client=OpenAI()

schema={"type":"object","properties":{"items":{"type":"array","items":{"type":"object","properties":{"word":{"type":"string"},"lemma":{"type":"string"},"translation":{"type":"string"},"partOfSpeech":{"type":"string"},"example":{"type":"string"},"pronunciation":{"type":"string"}},"required":["word","lemma","translation","partOfSpeech","example","pronunciation"],"additionalProperties":False}}},"required":["items"],"additionalProperties":False}

def translate(entry):
    prompt=f'''Você é um lexicógrafo de português brasileiro. Para o texto abaixo, traduza cada palavra/expressão listada para pt-BR no sentido exato do contexto. Não traduza o texto inteiro. Preserve a forma original em word, dê lemma na língua do texto, partOfSpeech em inglês (noun/verb/adjective/adverb/phrase/other), uma tradução curta e natural em translation, e escolha example como uma frase EXATA copiada do texto que contenha word. pronunciation deve ser uma pronúncia aproximada apenas para russo; para outras línguas use string vazia. Retorne JSON conforme o schema.

Idioma: {entry['language']}
Palavras: {', '.join(entry['words'])}
Texto:
{entry['content']}'''
    last=None
    for attempt in range(3):
        try:
            r=client.chat.completions.create(model='gpt-5-mini',messages=[{'role':'system','content':'Output only valid JSON. Do not explain.'},{'role':'user','content':prompt}],response_format={'type':'json_schema','json_schema':{'name':'vocab','strict':True,'schema':schema}},max_completion_tokens=5000,extra_body={'reasoning':{'effort':'minimal'}})
            raw=r.choices[0].message.content
            if raw:
                data=json.loads(raw)
                break
            last=f'empty response finish={r.choices[0].finish_reason}'
        except Exception as exc:
            last=str(exc)
    else:
        raise RuntimeError(f'LLM failed for {entry["id"]}: {last}')
    by={x['word'].lower():x for x in data['items']}
    out=[]
    sentences=re.split(r'(?<=[.!?。！？])\s+',entry['content'].strip())
    for word in entry['words']:
        item=by.get(word.lower())
        if not item:
            # retry-safe fallback; should be caught by audit
            item={'word':word,'lemma':word,'translation':'','partOfSpeech':'other','example':next((s for s in sentences if word.lower() in s.lower()),sentences[0]),'pronunciation':''}
        if word.lower() not in item['example'].lower():
            item['example']=next((s for s in sentences if word.lower() in s.lower()),sentences[0])
        out.append(item)
    return out

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:
    vocab=list(ex.map(translate, seed))
for entry,vs in zip(seed,vocab): entry['vocab']=vs
(ROOT/'scripts/batch1-enriched.json').write_text(json.dumps(seed,ensure_ascii=False,indent=2)+'\n')

def js(s): return json.dumps(s,ensure_ascii=False)
lines=["import {Language,TextItem,LanguageCode,Level,Theme,Vocab} from '../types';", "export const languages:Language[]=[{id:'en',name:'English',nativeName:'English',flag:'🇺🇸',targetLevel:'B1'},{id:'de',name:'German',nativeName:'Deutsch',flag:'🇩🇪',targetLevel:'A2'},{id:'es',name:'Spanish',nativeName:'Español',flag:'🇪🇸',targetLevel:'A2'},{id:'ru',name:'Russian',nativeName:'Русский',flag:'🇷🇺',targetLevel:'A1'}];", "export const levels:Level[]=['A1','A2','B1','B2','C1']; export const themes:Theme[]=['Tecnologia','AI Engineering','Futebol','Investigação','Cotidiano'];"]
items=[]
for e in seed:
    vocab={v['word']:{'word':v['word'],'lemma':v['lemma'],'translation':v['translation'],'partOfSpeech':v['partOfSpeech'],'example':v['example'],'pronunciation':v.get('pronunciation','')} for v in e['vocab']}
    items.append({'id':e['id'],'language':e['language'],'level':e['level'],'theme':e['theme'],'title':e['title'],'content':e['content'],'translation':'','wordCount':len(e['content'].split()),'chapter':1,'audioAvailable':True,'createdAt':'2026-10-06T00:00:00.000Z','vocab':vocab,'sourceUrl':e['sourceUrl'],'sourceSite':e['sourceSite']})
lines.append('export const texts:TextItem[]='+json.dumps(items,ensure_ascii=False,indent=2)+' as TextItem[];')
(ROOT/'src/data/content.ts').write_text('\n'.join(lines)+'\n')
print(f'generated {len(items)} texts and {sum(len(e["vocab"]) for e in seed)} vocab entries')
