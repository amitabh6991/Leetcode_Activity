// require ==> puppeteer , path , fs(fileSystem) ,xlsx
let puppeteer = require("puppeteer");
let path = require("path");
let fs = require("fs");
let xlsx = require("xlsx");

// Directory name where to create excel file 
let name = "leetcode problems";
let folderPath = path.join(__dirname, name);
dirCreater(folderPath);
let filePath = path.join(folderPath, name + ".xlsx");
// [],[{},{}]

// arr is array of objects 
// call to makeexcel function
//take every object to push in our excel file
function quesobj(arr) {
  for (let i = 0; i < arr.length; i++) {
    makeexcel(arr[i]);
  }
}

// original url where we go and autmate them 
let link = "https://leetcode.com/problemset/all/";

// get tagsName ==> search every tagName  on url
let tagNameArr = [
  "Array",
  "Hash Table",
  "Linked List",
  "Math",
  "Two Pointers",
  "String",
  "Binary Search",
  "Divide and Conquer",
  "Dynamic Programming",
  "Backtracking",
  "Stack",
  "Heap",
  "Greedy",
  "Sort",
  "Bit Manipulation",
  "Tree",
  "Depth-first Search",
  "Breadth-first Search",
  "Union Find",
  "Graph",
  "Design",
  "Topological Sort",
  "Trie",
  "Binary Indexed Tree",
  "Segment Tree",
  "Binary Search Tree",
  "Recursion",
  "Brainteaser",
  "Memoization",
  "Queue",
  "Minimax",
  "Reservoir Sampling",
  "Ordered Map",
  "Geometry",
  "Random",
  "Rejection Sampling",
  "Sliding Window",
  "Line Sweep",
  "Rolling Hash",
  "Suffix Array",
  "Dequeue"
];

console.log("Before");

//launch puppeteer ;
//go to link on new tab
//search every tagName 
// call to getListingProblem==>(return array of objects ) 
//call for push object in to excel
// press backspace 
(async function () {
  try {
    let browserInstance = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ["--start-maximized"],
    });
    let newPage = await browserInstance.newPage();
    await newPage.goto(link);

    for (let i = 0; i < tagNameArr.length ; i++) {
      let tagName = tagNameArr[i];

      let leetcode = await getListingProblem(tagName, newPage);
      console.log(leetcode);
      await quesobj(leetcode);
      for (let j = 0; j < tagName.length; j++) {
        await newPage.keyboard.press("Backspace");
      }
    }
  } catch (err) {
    console.log(err);
  }
})();


// wait for search bar selector 
// type tagName and press enter 
// wait for navigation change
//call to consolefn 
async function getListingProblem(tagName, newPage) {
  await newPage.waitForSelector(".form-control.list-search-bar", {
    visible: true,
  });

  await newPage.type(".form-control.list-search-bar", tagName, { delay: 50 });
  await newPage.keyboard.press("Enter");
  //todo ver important wait fr nevigation change
  await newPage.waitForNavigation({ waitUntil: "networkidle2" });
  
  await newPage.waitForSelector("td[label='Title']", { visible: true });
  await newPage.waitForSelector("td[label='Title'] a", { visible: true });
  await newPage.waitForSelector("td[label='Difficulty']", { visible: true });

  return await newPage.evaluate(
    consoleFn,
    "td[label='Title']",
    "td[label='Title'] a",
    "td[label='Difficulty']",
    tagName
  );
}

// using DOM 
// select all problem , link ,label  ==> return array 
// iterate them  and push in to object
// return array of objects  
function consoleFn(problemSelector, linkSelector, difficultySelector, tagName) {
  let problem = document.querySelectorAll(problemSelector);
  let link = document.querySelectorAll(linkSelector);
  let label = document.querySelectorAll(difficultySelector);

  let details = [];
  for (let i = 0; i < problem.length; i++) {
    let Topic = tagName;
    let Problem_Names = problem[i].innerText;
    let Difficulty_Label = label[i].innerText;
    let Problem_Links = link[i].href;
    details.push({
      Topic,
      Problem_Names,
      Problem_Links,
      Difficulty_Label,
    });
  }
  return details;
}

// make excel read ,push ,write 
function makeexcel(quesobj) {
  let content = excelReader(filePath, name);
  content.push(quesobj);
  excelWriter(filePath, content, name);
}
// excel reader 
function excelReader(filePath, name) {
  if (!fs.existsSync(filePath)) {
    return [];
  } else {
    // workbook => excel
    let wt = xlsx.readFile(filePath);
    // csk -> msd
    // get data from workbook
    let excelData = wt.Sheets[name];
    // convert excel format to json => array of obj
    let ans = xlsx.utils.sheet_to_json(excelData);
    // console.log(ans);
    return ans;
  }
}
//excel writer 
function excelWriter(filePath, json, name) {
  // console.log(xlsx.readFile(filePath));
  let newWB = xlsx.utils.book_new();
  // console.log(json);
  let newWS = xlsx.utils.json_to_sheet(json);
  // msd.xlsx-> msd
  //workbook name as param
  xlsx.utils.book_append_sheet(newWB, newWS, name);
  //   file => create , replace
  //    replace
  xlsx.writeFile(newWB, filePath);
}

// directoy creater using fs
function dirCreater(folderPath) {
  if (fs.existsSync(folderPath) == false) {
    fs.mkdirSync(folderPath);
  }
}
