import {
  Inria_Serif,
  Poppins,
  Lora,
  Reem_Kufi,
  Jaro,
  Poltawski_Nowy,
  Karma,
  Roboto_Slab,
  Raleway,
  DM_Serif_Display,
  EB_Garamond,
  Merriweather,
  Playfair_Display,
  Work_Sans,
  Noto_Serif
} from 'next/font/google';

export const inriaSerif = Inria_Serif({ subsets: ['latin'], weight: ['400', '700'] });
export const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'] });
export const lora = Lora({ subsets: ['latin'], weight: ['400', '700'] });
export const reemKufi = Reem_Kufi({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
export const jaro = Jaro({ subsets: ['latin'], weight: '400' });
export const karma = Karma({ subsets: ['latin'], weight: ['400', '700'] });
export const poltawskiNowy = Poltawski_Nowy({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
export const robotoSlab = Roboto_Slab({ subsets: ['latin'], weight: ['400', '500', '700'] });

// Additional stylish/serif fonts
export const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400' });
export const ebGaramond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
export const merriweather = Merriweather({ subsets: ['latin'], weight: ['400', '700'] });
export const notoSerif = Noto_Serif({ subsets: ['latin'], weight: ['400', '700'] });



export const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-playfair' });
export const workSans = Work_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-worksans' });
export const raleway = Raleway({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-raleway' });
