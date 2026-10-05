type FontFallback = {
  className: string;
  variable: string;
};

const fontFallback = (variable = ""): FontFallback => ({
  className: "",
  variable,
});

export const inriaSerif = fontFallback();
export const poppins = fontFallback();
export const lora = fontFallback();
export const reemKufi = fontFallback();
export const jaro = fontFallback();
export const karma = fontFallback();
export const poltawskiNowy = fontFallback();
export const robotoSlab = fontFallback();
export const dmSerif = fontFallback();
export const ebGaramond = fontFallback();
export const merriweather = fontFallback();
export const notoSerif = fontFallback();
export const playfair = fontFallback("--font-playfair");
export const workSans = fontFallback("--font-worksans");
export const raleway = fontFallback("--font-raleway");
export const cookie = fontFallback();
