import { Express } from "express";

import { healthzRouter, healthzPath } from "./healthz";
import { taskRouter, taskPath } from "./task";
import { verifyRouter, verifyPath } from "./verify";

export default function mountRoutes(app: Express) {
	app.use(healthzPath, healthzRouter);
	app.use(taskPath, taskRouter);
	app.use(verifyPath, verifyRouter);
}
