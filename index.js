const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");
const playSound = require("play-sound")({
	player:
		"D:TELECHARGEMENTS UP\2020.2021mplayer-svn-38117mplayer-svn-38117/mplayer.exe",
});
("use strict");

// async..await is not allowed in global scope, must use a wrapper
async function main() {
	// Generate test SMTP service account from ethereal.email
	// Only needed if you don't have a real mail account for testing
	let testAccount = await nodemailer.createTestAccount();

	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: process.env.PORT || 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: "process.env.EMAIL_SENDER",
			pass: "process.env.USER_PASS",
		},
	});

	// send mail with defined transport object
	let info = await transporter.sendMail({
		from: '"RDV " noreplay@gmail.com', // sender address
		to: "process.env.RECEIVERS_LIST", // list of receivers
		subject: "[RDV TCF]", // Subject line
		// text: "Hello world?", // plain text body
		html: `<h1>LES RDVS TCFS SONT DISPO FAIT VITE</h1>
                <p><a href='https://portail.if-algerie.com/exams'>click here</a></p>    
        `,
	});

	console.log("Message sent: %s", info.messageId);
	// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

	// Preview only available when sending through an Ethereal account
	console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
	// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

(async () => {
	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();

	while (true) {
		try {
			await page.goto("https://portail.if-algerie.com/", {
				waitUntil: "networkidle2",
			});
			await page.waitForSelector(".form-control");
			await page.type(".form-control", "process.env.ACOUNT_EMAIL");
			await page.type('[type="password"]', "process.env.ACOUNT_PASSWORD");
			await page.click('[for="checkbox-signup"]');
			await page.click("#login");
			await page.goto("https://portail.if-algerie.com/exams");
			break;
		} catch (error) {
			console.log("error");
		}
	}

	await page.waitForSelector(".form-control");
	await page.type(".form-control", "process.env.ACOUNT_EMAIL");
	await page.type('[type="password"]', "process.env.ACOUNT_PASSWORD");
	await page.click('[for="checkbox-signup"]');
	await page.click("#login");
	await page.goto("https://portail.if-algerie.com/exams");
	setInterval(async () => {
		await page.setCacheEnabled(false);
		await page.reload();
		// await page.waitForSelector(".fc-icon-right-single-arrow");
		// await page.click(".fc-icon-right-single-arrow");

		try {
			// await page.waitForSelector(".bg-info");
			if (
				await page.evaluate(() => {
					if (document.querySelector(".bg-info")) {
						return true;
					}
					return false;
				})
			) {
				main().catch(console.error);
				// playSound.play("./media/sound.mp3", (err) => {
				// 	if (err) console.log(err);
				// });
			} else {
				await page.evaluate(() => {
					const btn = document.querySelector("button.fc-corner-right");

					btn.click();
				});
				// await page.click("button.fc-corner-right");

				if (
					await page.evaluate(() => {
						if (document.querySelector(".bg-info")) {
							return true;
						}
						return false;
					})
				) {
					main().catch(console.error);
					// playSound.play("./media/sound.mp3", (err) => {
					// 	if (err) console.log(err);
					// });
				}
			}
		} catch (error) {
			console.log("there is an error", error);
		}
	}, 25000);

	await page.screenshot({ path: "example.png" });

	await browser.close();
})();
