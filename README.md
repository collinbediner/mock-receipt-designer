# Mock Receipt Designer

Mock Receipt Designer is a small React app for designing printable sample receipts for projects, presentations, UI demos, and props. All receipt information is typed in manually by the user.

Every receipt includes the permanent marking `SAMPLE - NOT A VALID RECEIPT` and the footer text `Created with Mock Receipt Designer - no proof of purchase value`. There is no setting to hide or remove those markings.

## What users can do

- Enter store, transaction, payment, customer, and receipt item details.
- Upload an optional logo image from their own computer.
- Add, edit, remove, and reorder receipt items.
- Calculate subtotal, discounts, tax, total, amount paid, and change due.
- Generate and edit a demo barcode that is not connected to any product database.
- Print the receipt on standard letter paper.
- Export the receipt as PNG or PDF.
- Keep unfinished work in browser localStorage.

## What the app does not do

- It does not create real receipts.
- It does not prove purchase.
- It does not use a backend server.
- It does not require an account.
- It does not upload receipt information or logo images anywhere.
- It does not search for or download company logos.

## Development setup

Open PowerShell in this project folder:

```powershell
G:\My Drive\AI CB\Projects\Receipt Generation
```

Install the project packages:

```powershell
npm install
```

Start the local development server:

```powershell
npm run dev
```

PowerShell will show a local address, usually `http://localhost:5173/`. Open that address in your browser to use the app.

## Useful commands

Run the calculation tests:

```powershell
npm test
```

Build the app for publishing:

```powershell
npm run build
```

Preview the finished build:

```powershell
npm run preview
```

## GitHub Pages deployment

This repo includes `.github/workflows/pages.yml`. After the project is pushed to GitHub and GitHub Pages is enabled for GitHub Actions, the workflow builds the app and publishes the `dist` folder.

## Screenshots

Add screenshots here after the app is running:

- Desktop two-column editor and preview
- Mobile stacked layout
- Exported sample receipt with watermark

## License

MIT
