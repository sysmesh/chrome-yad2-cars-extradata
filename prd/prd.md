# Product Requirements Document

## Overview
- **Product Name**: Yad 2 Extra Info Display
- **Date**: JAN-2026
- **Author**: Gilad Ariav
- **Version**: 1.0

## Goals
- When a user visits a Yad2 listing page, the script should extract additional information from the page and display it in a user-friendly format. I.e. Viewing a car will show the plate number, gov data etc.
- TBD - Need to define the exact information to extract and display

## Background
Yad2.co.il is an ads listing sites for selling and buying houses, cars and second hand items. When looking to buy a used car the site currently shows the car details based on what the user has entered and also shows an internal aproximate pricing based on the site's stats and data. This add on shall enhance that data allowing to extract more information from the photos the user uploaded and combine them with external data sources to provide more accurate and useful information to the user.

## Requirements
### Functional Requirements
1. The code shall be a valid chrome extension that can installed on any chrome browser.
2. The extension shall follow the Google chrome extension guidelines and best practices.
3. All code shall have try and except blocks to handle errors gracefully.
4. All code shall be well documented with comments and docstrings.
5. All code shall be well organized and structured.
6. All code shall be well tested and validated.
7. All code shall be well formatted and linted.
8. The extension shall ensure the user is on a site that is a yad2.co.il car listing (url must contain yad2.co.il/vehicles/item/). If not, the extension shall show an active/run option.
9. The extension shall have a button to run the extraction and display the results.
10. The extension shall have a button to clear the displayed results.
11. The extension shall have a button to close the displayed results.
12. The extension shall run button shall show as disabled or enabled depending on requirement number 8.
13. The extension shall have a settings page where the user can configure the extension (i.e. ChatGPT API key, token limit with a default value etc).
14. The extension setting page should have clear instuctions with screenshots that guide the user through the setup process and through how to get a proper API key.
15. When run the code shall extract all user item images (the images url contain https://img.yad2.co.il/Pic/ in them).
16. The code shall then send each image to an external AI service to extract relevant information from the image.
17. The code shall then display the extracted information in a user-friendly format.
18. Examples of information expected from the external AI image processing:
   - Car plate number
   - Car make and model
   - Car year
   - Car color
   - Car possible damage (based on visual analysis)
   
### Non-Functional Requirements
1. The extension should be lightweight and not impact the performance of the browser.
2. The extension should be secure and not expose any sensitive information.
3. The extension should be easy to use and understand.
4. The extension should be compatible with all modern browsers.
5. The extension should be able to handle large amounts of data without crashing.
6. The extension should be able to handle network errors gracefully.
7. The extension should be able to handle API rate limits gracefully.
8. The extension should be able to handle API errors gracefully.
9. The extension should be able to handle user input errors gracefully.
10. The extension should be able to handle user configuration errors gracefully.
11. The extension should be able to handle user permission errors gracefully.
12. The extension should be able to handle user authentication errors gracefully.
13. The extension should be able to handle user session errors gracefully.
14. The extension should be tested and validated before release.
15. The extension shall have good memory handling and prevent and memory leaks.

## User Stories
- As a non techincal user, I want to easily install and use the extension so that I can get more information about the car I'm interested in.
- As a user, I want to be able to configure the extension so that I can customize it to my needs.
