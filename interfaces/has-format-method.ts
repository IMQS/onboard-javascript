namespace HFM {
    /**
       * This interface is used to confirm the methods for rendering the headings and columns have both the arrayLength and internalFormat methods
       * @function arrayLength This function returns the length of the array created in the methods for fetching the columns and headings
       * @function internalFormat This function returns the formated string to be injected into the HTML DOM for the final grid
    */
    export interface HasFormatMethod {
        arrayLength(): number;
        internalFormat(): string;
    }
}