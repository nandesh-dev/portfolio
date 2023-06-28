rm -r docs
mkdir docs

parcel build src/desktop/index.html --dist-dir docs/desktop --public-url "https://www.nandesh.com/desktop/"
parcel build src/loader/index.html --dist-dir docs/ --public-url "https://www.nandesh.com/"