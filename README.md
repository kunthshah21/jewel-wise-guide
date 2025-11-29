# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/568b0bdf-15f3-4bf5-aec3-3e33d453a45e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/568b0bdf-15f3-4bf5-aec3-3e33d453a45e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server
npm run dev:frontend
```

**That's it!** The application now uses precomputed predictions and works without a Python backend.

This will start:
- **Frontend (Vite)**: http://localhost:5173

### Optional: Start with Backend (Advanced)

If you want to use the live ML API instead of precomputed predictions:

```bash
# Install Python dependencies
pip install -r requirements.txt

# On macOS, install OpenMP
brew install libomp

# Start both services
npm run dev
```

This will start both:
- **Frontend (Vite)**: http://localhost:5173
- **Backend (FastAPI)**: http://localhost:8000

For detailed ML setup, see [SETUP_ML.md](./SETUP_ML.md)


**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

### Frontend
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- React Query (TanStack Query)
- Recharts

### Backend (ML/API)
- Python 3.x
- FastAPI
- Pandas
- Scikit-learn
- XGBoost
- Pickle (Model persistence)

### Data
- Dashboard displays real data from JSON files (`/public/data/`)
- **ML predictions use precomputed historical data (no backend required)**
- 950+ precomputed predictions with 99.62% R² accuracy
- Optional: Connect to live ML API for real-time predictions

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/568b0bdf-15f3-4bf5-aec3-3e33d453a45e) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
