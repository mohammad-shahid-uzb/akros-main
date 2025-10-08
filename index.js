// import aor from "./routes/aor.js";
// import auth from "./routes/auth.js";
import rateRoutes from "./router.js"; // Corrected import
// import item from "./routes/itemlist.js";
// import home from "./routes/home.js";
// import register from "./routes/registration.js";
import cors from "cors";
// import BillableItemRouter from "./routes/billableItem.js";
// import ConstructionPhaseRouter from "./routes/constructionPhase.js";
// import TaskRouter from "./routes/tasks.js";
// import AorRouter from "./routes/aorItems.js";
// import OverheadCategoriesRouter from "./routes/overheadCategories.js";
// import { seedCategories, seedLogBookFormData } from "./seedData.js";
// import LogBookFormDataRouter from "./routes/logBookFormData.js";
import materialsRouter from "./routes/materials.js";
import suppliersRouter from "./routes/suppliers.js";
import materialSuppliersRouter from "./routes/materialSuppliers.js";
const app = express();

// ... existing code ...

// app.use("/api/auth", auth);

// Store uri in app.locals to make it accessible to route handlers
app.locals.mongodbUri = uri;
app.use("/api/rate", rateRoutes); // Mounted the correct router at the correct path
// app.use("/api/item", item);
// app.use("/api/register", register);

// Construction database routes
app.use("/api/materials", materialsRouter);
app.use("/api/suppliers", suppliersRouter);
app.use("/api/material-suppliers", materialSuppliersRouter);
