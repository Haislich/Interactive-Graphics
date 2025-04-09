
class Transformation {
	constructor(
		m00 = 0, m01 = 0, m02 = 0,
		m10 = 0, m11 = 0, m12 = 0,
		m20 = 0, m21 = 0, m22 = 0,
	) {

		this.data = new Array(
			m00, m10, m20,
			m01, m11, m21,
			m02, m12, m22
		);
	}

	matMul(other) {
		let out = new Transformation();
		for (let row = 0; row < 3; row++) {
			for (let col = 0; col < 3; col++) {
				for (let k = 0; k < 3; k++) {
					out.data[row * 3 + col] += this.data[row * 3 + k] * other.data[k * 3 + col];
				}
			}
		}
		return out
	}
	fromArray(array) {
		this.data = Array(
			array[0], array[1], array[2],
			array[3], array[4], array[5],
			array[6], array[7], array[8]
		)
	}
}


// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.

function GetTransform(positionX, positionY, rotation, scale) {
	let rad = rotation * Math.PI / 180;

	let cos = Math.cos(rad);
	let sin = Math.sin(rad);
	let scaleT = new Transformation(
		scale, 0, 0,
		0, scale, 0,
		0, 0, 1
	)
	let rotT = new Transformation(
		cos, -sin, 0,
		sin, cos, 0,
		0, 0, 1
	)
	let translT = new Transformation(
		1, 0, positionX,
		0, 1, positionY,
		0, 0, 1
	)
	return scaleT.matMul(rotT.matMul(translT)).data;
}



// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform(a, b) {

	let aT = new Transformation()
	aT.fromArray(a);

	let bT = new Transformation()
	bT.fromArray(b);
	return aT.matMul(bT).data
}
