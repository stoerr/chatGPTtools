# automates all project maintenance tasks

all: bin/_usages.txt personal/*.html README.md templates/*.json

bin/_usages.txt: bin/*
	cd bin; ./_makeusagetxt

personal/*.html: personal/*.properties
	cd personal; ./make.groovy

README.md: bin/_usages.txt
	project-bin/_makescriptlist

templates/*.json: templates/*.template.txt
	cd templates; ./makeTemplates.groovy
