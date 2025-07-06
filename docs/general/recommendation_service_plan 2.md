# Recommendation Service Implementation Plan

## Overall Goal

Improve the shopping experience and increase sales by providing personalized product suggestions.

## User Journeys

*   **New Customers:** Recommendations based on questions, past interactions, product data, and face shape.
*   **Existing Customers:** Recommendations based on past purchase history, frame measurements, and prescription information.

## Task Breakdown

1.  **Implement Data Fetching Utilities:**
    *   Subtask 1.1: Implement utility to fetch product data (name, description, categories, brand, price, images, etc.).
    *   Subtask 1.2: Implement utility to fetch existing customer data (purchase history, frame measurements, prescription information).
    *   Subtask 1.3: Implement utility to fetch new customer data (questionnaire responses, browsing history, face shape data).
2.  **Implement Embedding Generation:**
    *   Subtask 2.1: Implement utility to generate product embeddings based on product data.
    *   Subtask 2.2: Implement utility to generate user embeddings based on customer data (both new and existing).
3.  **Implement Recommendation Scoring and Filtering:**
    *   Subtask 3.1: Implement utility to calculate similarity scores between user embeddings and product embeddings.
    *   Subtask 3.2: Implement utility to filter recommendations based on frame measurements (ensure glasses fit the user's face).
    *   Subtask 3.3: Implement utility to filter recommendations based on prescription information (ensure frames are compatible with progressive lenses, etc.).
4.  **Implement Trending Products Logic:**
    *   Subtask 4.1: Implement utility to fetch trending products based on sales data, views, etc.
    *   Subtask 4.2: Implement utility to incorporate trending products into recommendations.
5.  **Implement Recommendation Saving:**
    *   Subtask 5.1: Implement utility to save recommendations to the database for future use.
6.  **Implement New Customer Questionnaire:**
    *   Subtask 6.1: Implement a questionnaire to gather information about new customers' preferences and needs.
7.  **Integrate Face Shape Data:**
    *   Subtask 7.1: Implement utility to process face shape data and use it to filter recommendations.

## Prioritization

1.  Subtask 1.1 (Fetch product data)
2.  Subtask 1.2 (Fetch existing customer data)
3.  Subtask 1.3 (Fetch new customer data)
4.  Subtask 2.1 (Generate product embeddings)
5.  Subtask 2.2 (Generate user embeddings)
6.  Subtask 3.1 (Calculate similarity scores)
7.  Subtask 3.2 (Filter by frame measurements)
8.  Subtask 3.3 (Filter by prescription information)
9.  Subtask 4.1 (Fetch trending products)
10. Subtask 4.2 (Incorporate trending products)
11. Subtask 5.1 (Save recommendations)
12. Subtask 6.1 (New customer questionnaire)
13. Subtask 7.1 (Integrate face shape data)

## Next Steps

Implement the data fetching utilities (Subtasks 1.1, 1.2, and 1.3).