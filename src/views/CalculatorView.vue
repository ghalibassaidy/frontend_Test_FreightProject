<script setup>
import { ref, onMounted, watch } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const countries = ref([])
const categories = ref([])
const destinations = ref([])
const selectedOrigin = ref('')
const selectedCategory = ref('')
const selectedDestination = ref('')
const destinationSearchTerm = ref('')
const weight = ref('')
const calculationResult = ref(null)
const isLoadingCategories = ref(false)
const isLoadingDestinations = ref(false)
const isCalculating = ref(false)

const authToken = localStorage.getItem('accessToken')

async function fetchCountries() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/countries/`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    if (!response.ok) throw new Error('Failed to fetch countries.')
    countries.value = await response.json()
  } catch (error) {
    console.error(error)
  }
}

async function fetchCategories(countryId) {
  if (!countryId) return
  isLoadingCategories.value = true
  categories.value = []
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories/?country_id=${countryId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    if (!response.ok) throw new Error('Failed to fetch categories.')
    categories.value = await response.json()
  } catch (error) {
    console.error(error)
  } finally {
    isLoadingCategories.value = false
  }
}

async function searchDestinations() {
  if (destinationSearchTerm.value.length < 3) {
    destinations.value = []
    return
  }
  isLoadingDestinations.value = true
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/destinations/?search=${encodeURIComponent(destinationSearchTerm.value)}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      },
    )

    if (!response.ok) throw new Error('Failed to fetch destinations from API.')

    destinations.value = await response.json()
  } catch (error) {
    console.error(error)
    destinations.value = []
  } finally {
    isLoadingDestinations.value = false
  }
}

function selectDestination(destination) {
  selectedDestination.value = destination.city_id
  destinationSearchTerm.value = `${destination.city_name}, ${destination.province}`
  destinations.value = []
}

async function handleCalculation() {
  if (
    !selectedOrigin.value ||
    !selectedCategory.value ||
    !selectedDestination.value ||
    !weight.value
  ) {
    alert('Please fill all fields before calculating.')
    return
  }
  isCalculating.value = true
  calculationResult.value = null
  const payload = {
    country_id: selectedOrigin.value,
    category_id: selectedCategory.value,
    destination_id: selectedDestination.value,
    weight: weight.value,
  }
  try {
    const response = await fetch(`${API_BASE_URL}/api/calculate-freight/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Calculation failed.')
    }
    calculationResult.value = await response.json()
  } catch (error) {
    console.error(error)
    alert(error.message)
  } finally {
    isCalculating.value = false
  }
}

function formatCurrency(value) {
  if (value === null || value === undefined) return ''
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

onMounted(() => {
  fetchCountries()
})

watch(selectedOrigin, (newVal) => {
  selectedCategory.value = ''
  fetchCategories(newVal)
})

let debounceTimer
watch(destinationSearchTerm, (newVal) => {
  if (
    selectedDestination.value &&
    newVal !== destinations.value.find((d) => d.city_id === selectedDestination.value)?.city_name
  ) {
    selectedDestination.value = ''
  }
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    searchDestinations()
  }, 300)
})
</script>

<template>
  <div class="view-container">
    <div class="calculator-container">
      <h1>Freight Calculator</h1>
      <form class="calculator-form" @submit.prevent="handleCalculation">
        <div class="form-row">
          <div class="form-group">
            <label for="origin">Origin</label>
            <select id="origin" name="origin" v-model="selectedOrigin">
              <option disabled value="">Select Origin Country</option>
              <option v-for="country in countries" :key="country.id" :value="country.id">
                {{ country.country_name }}
              </option>
            </select>
          </div>
          <div class="form-group destination-group">
            <label for="destination">Destination</label>
            <input
              type="text"
              id="destination"
              placeholder="Type to search city..."
              v-model="destinationSearchTerm"
              autocomplete="off"
            />
            <div v-if="isLoadingDestinations" class="loading-text">Loading...</div>
            <ul v-if="destinations.length > 0" class="destination-results">
              <li v-for="dest in destinations" :key="dest.city_id" @click="selectDestination(dest)">
                <strong>{{ dest.city_name }}</strong>
                <small>{{ dest.province }}</small>
              </li>
            </ul>
          </div>
        </div>
        <div class="form-group">
          <label for="category">Product Category</label>
          <select
            id="category"
            name="category"
            v-model="selectedCategory"
            :disabled="!selectedOrigin"
          >
            <option disabled value="">Select Product Category</option>
            <option v-if="isLoadingCategories">Loading...</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.category_title }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="weight">Total Weight</label>
          <div class="weight-input">
            <input
              type="number"
              id="weight"
              name="weight"
              placeholder="0"
              v-model.number="weight"
              min="0"
            />
            <span>Kg</span>
          </div>
        </div>
        <button type="submit" class="calculate-btn" :disabled="isCalculating">
          {{ isCalculating ? 'Calculating...' : 'Calculate' }}
        </button>
      </form>
      <div v-if="calculationResult" class="results-container">
        <h2>Calculation Result</h2>
        <div class="result-item">
          <span>Origin</span>
          <strong>{{ calculationResult.origin }}</strong>
        </div>
        <div class="result-item">
          <span>Destination</span>
          <strong>{{ calculationResult.destination }}</strong>
        </div>
        <hr />
        <div class="result-item">
          <span>International Shipping Price</span>
          <strong>{{ formatCurrency(calculationResult.international_price) }}</strong>
        </div>
        <div class="result-item">
          <span>Domestic Shipping Price</span>
          <strong>{{ formatCurrency(calculationResult.domestic_price) }}</strong>
        </div>
        <hr />
        <div class="result-item total">
          <span>Total Shipping Price</span>
          <strong>{{ formatCurrency(calculationResult.total_price) }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.view-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  min-height: calc(100vh - 100px);
}
.calculator-container {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 650px;
  border: 1px solid #e9ecef;
}
h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #212529;
  font-weight: 600;
}
.destination-group {
  position: relative;
}
.loading-text,
.destination-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 8px 8px;
  list-style-type: none;
  padding: 0;
  margin: -1px 0 0 0;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}
.loading-text {
  padding: 0.75rem;
  color: #6c757d;
}
.destination-results li {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
  padding: 0.75rem;
  cursor: pointer;
}
.destination-results li:hover {
  background-color: #f0f2f5;
}
.destination-results li strong {
  font-weight: 600;
}
.destination-results li small {
  color: #6c757d;
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}
select,
input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
select:focus,
input:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}
.weight-input {
  display: flex;
  align-items: center;
}
.weight-input span {
  margin-left: 1rem;
  font-weight: 500;
  color: #6c757d;
}
.calculate-btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background-color: #007bff;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s,
    transform 0.2s;
}
.calculate-btn:hover {
  background-color: #0069d9;
  transform: translateY(-2px);
}
.calculate-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
  transform: none;
}
.results-container {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}
.result-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 1rem;
}
.result-item span {
  color: #6c757d;
}
.result-item strong {
  color: #212529;
  font-weight: 500;
}
.result-item.total {
  font-size: 1.25rem;
  font-weight: 600;
}
.result-item.total strong {
  color: #007bff;
}
hr {
  display: none;
}
</style>
