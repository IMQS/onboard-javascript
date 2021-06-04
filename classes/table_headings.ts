import { HasFormatMethod } from "../interfaces/hasformatmethod.js";

export class tableHeadings implements HasFormatMethod {
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
		return `<th>${this.id}</th> <th>${this.A}</th> <th>${this.B}</th> <th>${this.C}</th> <th>${this.D}</th> <th>${this.E}</th> <th>${this.F}</th> <th>${this.G}</th> <th>${this.H}</th> <th>${this.I}</th> <th>${this.J}</th>`
	}
}