<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { excelToJson } from './util/excelToJson';
import Card from './components/Card.vue'

const rows = ref([]);
const headers = ref([]);
const filteredRows = ref([])  
const perPageNums = ref(10)
const curPage = ref(1)
const sortByItem = ref('') 
const searchID = ref('')

const filterByItem = ref('')
const filterComp = ref('')
const filterValue = ref()

onMounted(async () => {
  const data = await excelToJson()
  rows.value = data.rows
  headers.value = data.headers
  filteredRows.value = data.rows
  console.log("rows",rows.value)
})

function changePerPageNums(num) {
  perPageNums.value = num
  curPage.value = 1
  // console.log("nums", pageNums.value)
}

function sort() {
  if (sortByItem.value){
    console.log("sortByItem", sortByItem.value)
    sortData(sortByItem.value)
  }
}

function compareGeneIds(a, b) {
  console.log("in cmoomparre id")
  const numA = parseInt(a.replace('FBgn', ''), 10);
  const numB = parseInt(b.replace('FBgn', ''), 10);
  
  return numA - numB;
}

function sortData(header) {
  filteredRows.value = [...filteredRows.value].sort((a, b) => {
    let aVal = a[header];
    let bVal = b[header];
    console.log("aval", aVal)
    console.log("bval", bVal)
    

    if (aVal === 'NA' || aVal === null || aVal === undefined || aVal === '') return 1;
    if (bVal === 'NA' || bVal === null || bVal === undefined || bVal === '') return -1;

    if (header === 'ID') {
      return compareGeneIds(aVal, bVal);
    }

    const numA = Number(aVal);
    const numB = Number(bVal);
    console.log(numA - numB)
    return numA - numB;
  });
  console.log(filteredRows.value)
  curPage.value = 1;
}

const paginatedRows = computed(() => {
  console.log("recompute paginatedRows")
  const start = (curPage.value - 1) * perPageNums.value;
  const end = start + perPageNums.value;
  return filteredRows.value.slice(start, end);
});

function changePage(page){
  curPage.value = page
}

function search(){
  if (searchID.value === ""){
    filteredRows.value = rows.value
    return
  }
    
  filteredRows.value = [...rows.value].filter(row => row['ID'] === searchID.value)
  console.log(filteredRows.value[0])
}

function filter() {
  if (!filterValue.value) {
    alert("请输入值");
    return;
  }
  
  const item = filterByItem.value;
  const inputValue = filterValue.value;
  const numValue = Number(inputValue);
  const isNumeric = !isNaN(numValue);
  
  console.log("in filter")
  console.log("input value", numValue)
  console.log("filterComp", filterComp.value)
  console.log("filterItem", item)
  
  filteredRows.value = rows.value.filter(row => {
    const rowValue = row[item];
    console.log("rowValue", rowValue)
    if (rowValue === 'NA' || rowValue === null || rowValue === undefined || rowValue === '') {
      return false
    }
    
    switch (filterComp.value) {
      case '大于':
        console.log(isNumeric ? Number(rowValue) > numValue : false)
        return isNumeric ? Number(rowValue) > numValue : false;
      case '小于':
        return isNumeric ? Number(rowValue) < numValue : false;
      case '等于':
        return isNumeric 
          ? Number(rowValue) === numValue
          : String(rowValue) === String(inputValue);
      case '大于等于':
        return isNumeric ? Number(rowValue) >= numValue : false;
      case '小于等于':
        return isNumeric ? Number(rowValue) <= numValue : false;
      default:
        return false;
    }
  });
  
  curPage.value = 1;
}
</script>

<template>
  <div>
    <div class="mb-3">
      <label for="search" class="form-label">Searching ID</label>
      <input type="text" class="form-control" id="search" placeholder="id" v-model="searchID">
      <button type="button" class="btn btn-primary" @click="search">Search</button>
    </div>

    <hr class="hr"/>

    <div class="mb-3">
      <div class="form-floating">
        <select class="form-select" id="floatingSelect" v-model="filterByItem">
          <option selected></option>
          <option :value="item" v-for="(item) in headers.filter(head => head != 'ID')">
            {{ item }}
          </option>
        </select>
        <label for="floatingSelect">filter By</label>
      </div>
      <div class="form-floating">
        <select class="form-select" id="floatingSelect" v-model="filterComp">
          <option selected></option>
          <option value="大于">大于</option>
          <option value="等于">等于</option>
          <option value="小于">小于</option>
          <option value="小于等于">小于等于</option>
          <option value="大于等于">大于等于</option>
        </select>
        <label for="floatingSelect">compare</label>
      </div>
      <input type="number" class="form-control" id="filter" placeholder="value" v-model="filterValue"/>
      <button type="button" class="btn btn-primary" @click="filter">Filter</button>
    </div>

    <hr class="hr"/>

    <div class="form-floating">
      <select class="form-select" id="floatingSelect" v-model="sortByItem">
        <option selected></option>
        <option :value="item" v-for="(item) in headers">
          {{ item }}
        </option>
      </select>
      <label for="floatingSelect">Sort By</label>
      <button type="button" class="btn btn-primary" @click="sort">Sort</button>
    </div>

    <hr class="hr"/>    

    <h5 class="header">切换每页条目数量:</h5>
    <div class="buttons">
      <button type="button" class="btn btn-primary" @click="changePerPageNums(10)">10</button>
      <button type="button" class="btn btn-info" @click="changePerPageNums(20)">20</button>
      <button type="button" class="btn btn-success" @click="changePerPageNums(50)">50</button>
    </div>
    
    <table class="table">
      <thead>
        <tr>
          <th scope="col" v-for="(item, index) in headers">{{ item }}</th>
        </tr>
      </thead>
      <tbody class="table-group-divider">
        <Card v-for="(item, index) in paginatedRows"
          :key="item.ID"
          :item="item"
        />
      </tbody>
    </table>
    <nav aria-label="Page navigation example">
      <ul class="pagination">
        <li class="page-item">
          <a class="page-link" href="#" aria-label="Previous"
          @click.prevent="changePage(Math.max(1, curPage - 1))">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
        <li class="page-item" v-for="(item, index) in Array.from({length: Math.ceil(filteredRows.length/perPageNums)})">
          <a class="page-link" href="#"
          @click.prevent="changePage(index + 1)" 
          :class="{active: curPage === index + 1}"
          >{{ index + 1 }}</a>
        </li>
        <li class="page-item">
          <a class="page-link" href="#" aria-label="Next"
          @click.prevent="changePage(Math.min(Math.ceil(filteredRows.length/perPageNums), curPage + 1))">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
.buttons {
  text-align: center;
}

.btn {
  margin-right: 5%;
}

.header {
  margin-top: 5%;
}

.hr {
  border: 2px solid black;
}
</style>
