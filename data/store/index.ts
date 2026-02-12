/**
 * Store index — re-exports everything for clean imports
 */

export { PRODUCTS, getProductById, getProductsByCategory, getProductsByProblem, getProductsByBudget } from './products';
export { generateRecommendations } from './recommendations';
export { PROBLEM_CATEGORIES, getSolutionsForProblem, getAllProblems } from './problemSolver';
export { getTimeGainItems, getTimeGainSummary, formatCostPerMinute, formatGainRange } from './timeGains';
export { buildKit } from './kitBuilder';
