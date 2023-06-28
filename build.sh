rm -r docs
mkdir docs

parcel build src/desktop/index.html --dist-dir docs/desktop
parcel build src/loader/index.html --dist-dir docs/