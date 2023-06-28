rm -r build
mkdir build

parcel build src/desktop/index.html --dist-dir build/desktop
parcel build src/loader/index.html --dist-dir build/