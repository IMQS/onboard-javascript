import { HasFormatMethod } from "../interfaces/hasformatmethod.js";

export class recordStruct implements HasFormatMethod {
    private id: string;
	private A: string;
	private B: string;
	private C: string;
	private D: string;
	private E: string;
	private F: string;
	private G: string;
	private H: string;
	private I: string;
	private J: string;

	constructor( id: string, a: string, b: string, c: string, d: string, e: string, f: string, g: string, h: string, i: string, j: string ){
		this.id = id;
		this.A = a;
		this.B = b;
		this.C = c;
		this.D = d;
		this.E = e;
		this.F = f;
		this.G = g;
		this.H = h;
		this.I = i;
		this.J = j;	
	}

	format() {
		return `<td>${this.id}</td> <td>${this.A}</td> <td>${this.B}</td> <td>${this.C}</td> <td>${this.D}</td> <td>${this.E}</td> <td>${this.F}</td> <td>${this.G}</td> <td>${this.H}</td> <td>${this.I}</td> <td>${this.J}</td>`
	}
}