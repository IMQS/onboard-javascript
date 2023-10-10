/**
 * Project Overview - MVC Architecture:
 *
 * This project adheres to the Data-> Model-View-Controller (MVC) design pattern, ensuring a clear separation of concerns:
 *
 1. **Data Source**:
 *    - The foundational source from which the application retrieves its raw data. This is
 *      API endpoints.
 *
 * 2. **Model** (`StateManager`):
 *    - Manages the state and data of the application.
 *    - Interfaces with the data source to handle data retrieval, filtering, pagination, and other data-related operations.
 *
 * 3. **View** (`TableRenderer`):
 *    - Responsible for rendering and updating the user interface.
 *    - Renders column headers, records, and manages the visual representation.
 *
 * 4. **Controllers**:
 *    - **WindowResizeHandler**: Detects window resize events and updates the table view accordingly.
 *    - **PaginationManager**: Manages page navigation, searching functionalities, and live input validation.
 *
 */

/*** Main Script ***/

window.onload = async () => {
	// Initialize data.ts
	const apiManager = new ApiManager();

	// Initialize model.ts
	const stateManager = new StateManager(apiManager);
	await stateManager.initializeState();

	// Initialize views.ts
	const tableRenderer = new TableRenderer(stateManager);
	await tableRenderer.initialRender();

	// Initialize controllers.ts
	const paginationManager = new PaginationManager(
		tableRenderer,
		stateManager
	);
	const windowResizeHandler = new WindowResizeHandler(
		tableRenderer,
		stateManager,
		paginationManager
	);
};
