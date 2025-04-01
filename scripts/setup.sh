echo "Configuring git hooks"

git config core.hooksPath .githooks


echo "Installing dependencies"
pnpm install
