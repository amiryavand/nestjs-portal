export const generateRandomKey = (min = 100000, max = 999999): number => {
  return Math.floor(Math.random() * max) + min;
};