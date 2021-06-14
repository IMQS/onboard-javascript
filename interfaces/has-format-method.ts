// interface to ensure methods implementing this interface contain a internalFormat method that returns a string (the string generated for the elements inside the table)
export interface HasFormatMethod {
    arrayLength(): number;
    internalFormat(): string;
}