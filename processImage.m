function processImage(inputImagePath, outputImagePath)
   


inputImage = imread(inputImagePath);


if size(inputImage, 3) == 3
    grayImage = rgb2gray(inputImage);
else
    grayImage = inputImage;
end


equalizedImage = histeq(grayImage);


claheImage = adapthisteq(equalizedImage, 'NumTiles', [8 8], 'ClipLimit', 0.015); 
% Lower ClipLimit avoids over-brightening


bilateralFilteredImage = imbilatfilt(claheImage, 20, 5);
%reudces noice and preserves edges
% Sigma 20 for spatial, 5 for range filtering


cleanedImage = medfilt2(bilateralFilteredImage, [3 3]); 
se = strel('disk', 1); 
cleanedImage = imopen(cleanedImage, se); 


localContrastEnhanced = imadjust(cleanedImage, stretchlim(cleanedImage, [0.05 0.95]), []); % Narrower limits to avoid overexposure


gammaCorrectedImage = imadjust(localContrastEnhanced, [], [], 0.95);
% Closer to 1 for reduced brightening
%reduces brightness


gaussianBlurredImage = imgaussfilt(gammaCorrectedImage, 2); 
highPassImage = gammaCorrectedImage - gaussianBlurredImage;
sharpenedImage = imadd(gammaCorrectedImage, highPassImage);


finalImage = imadjust(sharpenedImage, stretchlim(sharpenedImage, [0.03 0.97]), []); 


finalImage = imadjust(finalImage, [], [0 0.95]); 




scaleFactor = 7;
upscaledImage = imresize(finalImage, scaleFactor, 'bicubic'); 
%  'bicubic' gives smoother results


noiseVariance = 0.01;
deblurredImage = deconvwnr(upscaledImage, fspecial('gaussian', [5 5], 2), noiseVariance);

sharpenedUpscaledImage = imsharpen(deblurredImage, 'Radius', 1, 'Amount', 1.5);

imwrite(sharpenedUpscaledImage, outputImagePath);
    
    
    disp('Image processed and saved successfully');
end
