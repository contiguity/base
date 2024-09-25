require("dotenv").config()

const contiguity = require('@contiguity/base')
const db = contiguity.db(process.env.CONTIGUITY_BASE_APIKEY, process.env.CONTIGUITY_BASE_PROJECTID);
const orwellEmailDB = db.Base("orwell_email");

const express = require("express")
const app = express()
const cors = require("cors")

app.use(cors())
app.use(express.json());

async function getEmailTracker(id) {
	try {
		const tracker = await orwellEmailDB.get(id);
		return tracker;
	} catch (error) {
		console.error(`Error getting email tracker for ID ${id}:`, error);
		throw error;
	}
}

async function readEmail(id) {
	try {
		const tracker = await getEmailTracker(id);

		if (tracker) {
			await orwellEmailDB.update(
				{ 
					"tracker.viewed": true, 
					"tracker.view_count": orwellEmailDB.util.increment(1)
				},
				id
			);
		}
	} catch (error) {
		console.error(`Error reading email with ID ${id}:`, error);
		throw error;
	}
}

app.get("/", async function (req, res) {
	res.send("API")
})

app.get("/email/:id", async (req, res) => {
	const pixel = Buffer.from("R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=", "base64")

	await readEmail(req.params.id)

	res.set({
		"Content-Type": "image/png",
		"Content-Length": pixel.length,
		"Cache-Control": "no-cache, no-store, must-revalidate",
		Pragma: "no-cache",
		Expires: 0,
	})

	res.send(pixel)
})

app.get("/email/status/:id", async (req, res) => {
	try {
		const email = await getEmailTracker(req.params.id);
		
		if (!email) {
			return res.status(404).json({ message: "Email not found" });
		}

		res.json({
			delivered: true,
			tracker: {
				viewed: email.tracker.viewed,
				view_count: email.tracker.view_count,
			},
		});
	} catch (error) {
		console.error(`Error getting email status for ID ${req.params.id}:`, error);
		res.status(500).json({ message: "Internal server error" });
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
})
