import { Part } from '../model/types';

export function createFilter(part: Part, filters: string): boolean {
  // We return a function for the MatTableDataSource to call for each item in the source

  function matchDim(dimValue: string, filterValue: string): boolean {
    if (filterValue === '10+') {
      return parseFloat(dimValue) > 10;
    } else {
      return dimValue === filterValue;
    }
  }

  function getFilterValue(
    keyName: string,
    mappedFilters: Map<unknown, unknown>
  ): string | undefined {
    return mappedFilters.get(keyName) !== 'All'
      ? (mappedFilters.get(keyName) as string)
      : undefined;
  }

  const mappedFilters = new Map(JSON.parse(filters));
  let isMatch = true;

  const nameFilterValue = mappedFilters.get('name') as string;
  const categoryFilterValue = getFilterValue('category', mappedFilters);
  const dim1FilterValue = getFilterValue('dim1', mappedFilters);
  const dim2FilterValue = getFilterValue('dim2', mappedFilters);
  const heightFilterValue = getFilterValue('height', mappedFilters);
  const boxFilterValue = getFilterValue('box', mappedFilters);

  const nameValue = part['name'].toString().toLowerCase();
  const categoryValue = part['category'].toString().toLowerCase();
  const dim1Value = part['dim1'].toString();
  const dim2Value = part['dim2'].toString();

  // if no filter was specified by the user, show nothing
  if (
    !(
      nameFilterValue?.length > 2 ||
      categoryFilterValue ||
      dim1FilterValue ||
      dim2FilterValue ||
      heightFilterValue ||
      boxFilterValue
    )
  ) {
    isMatch = false;
  }

  // Apply filters until the part does no longer passes one of the filters
  if (isMatch && nameFilterValue && nameFilterValue.length > 2) {
    // Only filter on free text if more than 2 characters are filled.
    // Match on name or partnumber ( id )
    isMatch =
      nameValue.includes(nameFilterValue.toLowerCase()) ||
      categoryValue.includes(nameFilterValue.toLowerCase()) ||
      part['partnumber'] == nameFilterValue;
  }

  if (isMatch && categoryFilterValue) {
    isMatch = categoryValue.includes(categoryFilterValue.toLowerCase());
  }

  // Both dim fields filled with different values.
  // Match each field on either value: 1 x 2 and 2 x 1
  if (isMatch) {
    if (
      dim1FilterValue &&
      dim2FilterValue &&
      dim1FilterValue !== dim2FilterValue
    ) {
      isMatch =
        (matchDim(dim1Value, dim1FilterValue) &&
          matchDim(dim2Value, dim2FilterValue)) ||
        (matchDim(dim2Value, dim1FilterValue) &&
          matchDim(dim1Value, dim2FilterValue));
    } else if (
      dim1FilterValue &&
      dim2FilterValue &&
      dim1FilterValue === dim2FilterValue
    ) {
      // Both dim filters are filled equal (2 x 2).
      // Match both dimension fields to that filter.
      isMatch =
        matchDim(dim1Value, dim1FilterValue) &&
        matchDim(dim2Value, dim1FilterValue);
    } else if (dim1FilterValue || dim2FilterValue) {
      // Only one of the dim filters is filled.
      // Match either dimension fields to that filter.
      const dimFilterValue = dim1FilterValue || dim2FilterValue;
      isMatch =
        matchDim(dim1Value, dimFilterValue as string) ||
        matchDim(dim2Value, dimFilterValue as string);
    }
  }

  if (isMatch && heightFilterValue) {
    const cellValueNum: number =
      part['height'] === '' ? 0 : parseFloat(part['height']);
    // Filter on upper and lower
    if (['1', '2', '3'].includes(heightFilterValue)) {
      isMatch = cellValueNum === parseFloat(heightFilterValue);
    } else if (heightFilterValue === '0-1') {
      isMatch = cellValueNum > 0 && cellValueNum < 1;
    } else if (heightFilterValue === '1-2') {
      isMatch = cellValueNum > 1 && cellValueNum < 2;
    } else if (heightFilterValue === '2-3') {
      isMatch = cellValueNum > 2 && cellValueNum < 3;
    } else if (heightFilterValue === '3-6') {
      isMatch = cellValueNum > 3 && cellValueNum < 6;
    } else if (heightFilterValue === '6+') {
      isMatch = cellValueNum > 6;
    }
  }

  if (isMatch && boxFilterValue) {
    const cellBoxValue = part['box'] || '';
    if (boxFilterValue === 'any box') {
      isMatch = cellBoxValue !== '';
    } else if (boxFilterValue === 'not in box') {
      isMatch = cellBoxValue === '';
    } else {
      // Eventually filter for box value
      isMatch = cellBoxValue === boxFilterValue;
    }
  }

  return isMatch;
}
