import {Card} from '../types';
export type Rating='again'|'hard'|'good'|'easy';
export function reviewCard(card:Card,rating:Rating):Card{let q=rating==='again'?0:rating==='hard'?3:rating==='good'?4:5;let ef=Math.max(1.3,card.easeFactor+(0.1-(5-q)*(0.08+(5-q)*0.02)));let repetitions=card.repetitions,interval=card.interval,lapses=card.lapses;if(q<3){repetitions=0;interval=1;lapses+=1}else{repetitions+=1;if(repetitions===1)interval=1;else if(repetitions===2)interval=6;else interval=Math.round(interval*ef);if(rating==='easy')interval=Math.round(interval*1.3)}return {...card,easeFactor:Number(ef.toFixed(2)),repetitions,interval,lapses,dueDate:Date.now()+interval*86400000,lastReviewed:Date.now()}}
export const isDue=(c:Card)=>c.dueDate<=Date.now();
