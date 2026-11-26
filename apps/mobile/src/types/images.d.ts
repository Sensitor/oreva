/** Bundled images: Metro resolves them to an asset id (a number). */
declare module '*.jpg' {
  const asset: number;
  export default asset;
}
