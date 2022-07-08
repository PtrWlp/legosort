export interface PartFilter {
  name: string;
  options: string[];
  defaultValue: string;
}

export interface Part {
  partnumber : string,
  name: string,
  image: string,
  dim1: string,
  dim2: string,
  height: string,
  category: string,
  isSubPart: boolean,
  dimensions: string,
  boxId?: string,
  box?: string,
}

export interface PartInBox {
  id?: string,
  partnumber : string,
  box: string,
}

export interface BoxWithParts {
  box: string,
  parts: Part[],
}
