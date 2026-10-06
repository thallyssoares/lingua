export type LanguageCode='en'|'de'|'es'|'ru'; export type Level='A1'|'A2'|'B1'|'B2'|'C1'; export type Theme='Tecnologia'|'AI Engineering'|'Futebol'|'Investigação'|'Cotidiano';
export interface Language{id:LanguageCode;name:string;nativeName:string;flag:string;targetLevel:Level}
export interface TextItem{id:string;language:LanguageCode;level:Level;theme:Theme;title:string;content:string;translation:string;wordCount:number;chapter:number;seriesId?:string;audioAvailable:boolean;createdAt:string;vocab:Record<string,Vocab>;sourceUrl?:string;sourceSite?:string}
export interface Vocab{word:string;lemma:string;translation:string;partOfSpeech:string;example:string;pronunciation?:string}
export interface Card{id:string;textId:string;word:string;lemma:string;sentence:string;translation:string;language:LanguageCode;level:Level;createdAt:number;dueDate:number;interval:number;easeFactor:number;repetitions:number;lapses:number;lastReviewed?:number}
export interface UserSettings{activeLanguage:LanguageCode;levelsByLanguage:Record<LanguageCode,Level>;dailyTextGoal:number;dailyNewCardsGoal:number;showTransliteration:boolean;theme:'light'|'dark'}
