const xml2js = require('xml2js');
const fs = require('fs');
const parser = new xml2js.Parser({ attrkey: "ATTR" });

let categories_string = fs.readFileSync("categories.xml", "utf8");
let categoriesToKeep = [
  'Antenna', 'Arch', 'Ball', 'Bar', 'Baseplate', 'Bracket', 'Brick', 'Chain',
  'Cockpit', 'Cone', 'Container', 'Cylinder', 'Dish', 'Door', 'Fence', 'Flag', 'Hinge',
  'Hook', 'Hose', 'Ladder', 'Magnet', 'Panel', 'Plant', 'Plate',
  'Propeller', 'Ring', 'Rock', 'Roof', 'Slope', 'Stairs',
  'Support', 'Tail', 'Tap', 'Technic', 'Tile', 'Train', 'Vehicle', 'Wedge', 'Wheel',
  'Window', 'Windscreen', 'Wing',
];
let myCategories = [];
parser.parseString(categories_string, function (error, data) {
  if (error) { console.log(error) } else {
    data.CATALOG.ITEM.forEach(category => {
      if (categoriesToKeep.find((cat) => category.CATEGORYNAME[0].includes(cat))) {
        myCategories[category.CATEGORY] = category.CATEGORYNAME[0];
      }
    });
  }
});

function toFractals(value) {
  const segments = value.split('.');
  if (segments.length === 1) {
    return value;
  }
  if (segments[1] === '13') {
    return `${segments[0]} 1/8`;
  }
  if (segments[1] === '33') {
    return `${segments[0]} 1/3`;
  }
  if (segments[1] === '3') {
    return `${segments[0]} 1/3`;
  }
  if (segments[1] === '25') {
    return `${segments[0]} 1/4`;
  }
  if (segments[1] === '5') {
    return `${segments[0]} 1/2`;
  }
  if (segments[1] === '75') {
    return `${segments[0]} 3/4`;
  }
  if (segments[1] === '67') {
    return `${segments[0]} 2/3`;
  }
  if (segments[1] === '63') {
    return `${segments[0]} 5/8`;
  }
  if (segments[1] === '38') {
    return `${segments[0]} 3/8`;
  }
  return value;
}

let xml_string = fs.readFileSync("Parts.xml", "utf8");
let myParts = [];

let dim1Distinct = [];
let dim2Distinct = [];
let heightDistinct = [];
let categoryDistinct = [];

parser.parseString(xml_string, function (error, data) {
  if (error) { console.log(error) } else {
    data.CATALOG.ITEM.forEach(element => {
      const partnumber = element.ITEMID[0];
      let name = element.ITEMNAME[0].replace('&#40;', '(').replace('&#41;', ')');
      const image = `${partnumber}.png`;
      const dim1 = toFractals(element.ITEMDIMX[0]);
      if (!dim1Distinct.includes(dim1)) {dim1Distinct.push(dim1)};

      const dim2 = toFractals(element.ITEMDIMY[0]);
      if (!dim2Distinct.includes(dim2)) {dim2Distinct.push(dim2)};

      const height = toFractals(element.ITEMDIMZ[0]);
      if (!heightDistinct.includes(height)) {heightDistinct.push(height)};

      const category = myCategories[element.CATEGORY] || '';
      if (!categoryDistinct.includes(category)) {categoryDistinct.push(category)};

      const isSubPart = partnumber.replace(/[0-9]/g, '') !== '';
      const isDuplo = name.slice(0, 5) === 'Duplo';

      if (myCategories[element.CATEGORY[0]] && !isSubPart && !isDuplo) {
        name = name.replace(`${category}`, '');
        let dimensions = '';
        if (dim1?.length && dim2?.length && height?.length) {
          dimensions = `${dim1} x ${dim2} x ${height}`;
          name = name.replace(`${dimensions}`, '');
        }
        if (dim1?.length && dim2?.length) {
          // what if the name does not include height?
          twoDimensions = `${dim1} x ${dim2}`;
          if (name.includes(twoDimensions)) {
            dimensions = twoDimensions;
            name = name.replace(`${dimensions}`, '');
          }
        }
        if (name.slice(0,1) === ',') {
          name = name.slice(1);
        }
        name = name.trimStart();
        myParts.push({
          partnumber,
          name,
          image,
          dim1,
          dim2,
          height,
          category,
          isSubPart,
          dimensions,
        })
      }
    });
  }
});
// console.log(myParts);
fs.writeFileSync('../apps/legosort/data/selectedParts.json', JSON.stringify(myParts), 'utf8');
fs.writeFileSync('../apps/legosort/data/distinctDim1.json', JSON.stringify(dim1Distinct), 'utf8');
fs.writeFileSync('../apps/legosort/data/distinctCategory.json', JSON.stringify(categoryDistinct), 'utf8');

