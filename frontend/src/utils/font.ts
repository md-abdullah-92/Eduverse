// src/utils/font.ts
import { Inria_Serif, Poppins, Lora, Reem_Kufi, Jaro,Poltawski_Nowy,Karma,Roboto_Slab } from 'next/font/google';

export const inriaSerif = Inria_Serif({ subsets: ['latin'], weight: ['400', '700'] });
export const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'] });
export const lora = Lora({ subsets: ['latin'], weight: ['400', '700'] });
export const reemKufi = Reem_Kufi({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
export const jaro = Jaro({ subsets: ['latin'], weight: '400' });
export const karma = Karma({ subsets: ['latin'], weight: ['400', '700'] }); // ← Add this line
export const poltawskiNowy = Poltawski_Nowy({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // pick what you need
});
export const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  weight: ['400', '500', '700'], // choose what you need
});

