import {Capacitor} from '@capacitor/core';
import {TextToSpeech} from '@capacitor-community/text-to-speech';
import {LanguageCode} from '../types';
const voices:Record<LanguageCode,string>={en:'en-US',de:'de-DE',es:'es-ES',ru:'ru-RU'};
export async function speak(text:string,language:LanguageCode){const lang=voices[language];if(Capacitor.isNativePlatform()){try{await TextToSpeech.stop();await TextToSpeech.speak({text,lang,rate:0.9,pitch:1,volume:1});return true}catch{ /* fallback abaixo */ }}if('speechSynthesis'in window){window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=lang;window.speechSynthesis.speak(u);return true}return false}
export async function stopSpeaking(){if(Capacitor.isNativePlatform()){try{await TextToSpeech.stop()}catch{}}if('speechSynthesis'in window)window.speechSynthesis.cancel()}
