# Math and Multi Language OCR

This extension OCRs images that you have on your roam graph. 

- It supports up to two languages plus math and handwritten text. 
- Each of the two languages can be mixed, e.g., 'ara+eng'
- Images do not need to be uploaded into your roam graph and can be linked to external resources (i.e., no CORS issue). - It works nicely on extracted area highlights by the PDF Highlighter. So highlight math and then extract the equations as LaTeX!

# Functionalities
- **Parameters** 
    - Language codes: List of langauage code [here](https://tesseract-ocr.github.io/tessdoc/Data-Files-in-different-versions.html).
	- Clean up: The extracted text will be the child block of the image. If you are only interested in the extracted text and not the original image, you can "cleanup" by pressing the `cleanKey` shortcut which will replace the image block with the extracted text and remove the text block. 
    - Clean up but save the image reference: If you want to save a reference to the original image (just in case, as an alias) you can set `saveRef2Img: true`.
	
- **Mathpix Support**
	- APP ID and KEY: You need to set up a mathpix account and get an app id and key. Read more about mathpix great service [here](https://mathpix.com/#features). And find their API [here](https://docs.mathpix.com/#introduction).

# YouTube Demos
	- New tutorial: 
	[![ocrwithcors](https://img.youtube.com/vi/N8DOqIZQFLU/0.jpg)](https://www.youtube.com/watch?v=N8DOqIZQFLU)

	- Older tutorial:
	[![ocrgist](https://img.youtube.com/vi/BSVxxDsZVNQ/0.jpg)](https://youtu.be/BSVxxDsZVNQ)

