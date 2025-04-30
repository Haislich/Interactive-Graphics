// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix(translationX, translationY, translationZ,
	rotationX, rotationY) {

	// [TO-DO] Modify the code below to form the transformation matrix.
	const cX = Math.cos(rotationX), sX = Math.sin(rotationX);
	const cY = Math.cos(rotationY), sY = Math.sin(rotationY);

	const rotX = [
		1, 0, 0, 0,
		0, cX, sX, 0,
		0, -sX, cX, 0,
		0, 0, 0, 1
	];
	const rotY = [
		cY, 0, -sY, 0,
		0, 1, 0, 0,
		sY, 0, cY, 0,
		0, 0, 0, 1
	];
	const trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	return MatrixMult(trans, MatrixMult(rotX, rotY));
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer {

	// The constructor is a good place for taking care of the necessary initializations.
	constructor() {
		// [TO-DO] initializations
		const meshVS = `
						attribute vec3 pos;
						attribute vec3 normal;
						attribute vec2 texCoord;

						uniform mat4 mvp;          // projection * model-view
						uniform mat4 mv;           // model-view
						uniform mat3 nMat;         // normal-matrix (inverse-transpose)
						uniform bool swapYZ;

						varying vec3 v_n;
						varying vec3 v_pos;
						varying vec2 v_tc;

						void main()
						{
						vec3 p = pos;
						vec3 n = normal;
						if (swapYZ) {
						p = vec3(p.x, p.z, p.y);
						n = vec3(n.x, n.z, n.y);
						}

						v_pos = (mv * vec4(p, 1.0)).xyz;   // view-space position
						v_n   = normalize(nMat * n);       // view-space normal
						v_tc  = texCoord;

						gl_Position = mvp * vec4(p, 1.0);
						}`;

		const meshFS = `
						precision mediump float;

						varying vec3 v_n;
						varying vec3 v_pos;
						varying vec2 v_tc;

						uniform sampler2D tex;
						uniform bool  useTexture;
						uniform vec3  lightDir;      // view-space, **must be normalised**
						uniform float shininess;

						void main()
						{
						vec3 N = normalize(v_n);
						vec3 L = normalize(lightDir);
						vec3 V = normalize(-v_pos);            // camera at origin
						vec3 H = normalize(L + V);             // Blinn half-vector

						float diff = max(dot(N, L), 0.0);
						float spec = (diff > 0.0)
						? pow(max(dot(N, H), 0.0), shininess)
						: 0.0;

						vec3 Kd = useTexture ? texture2D(tex, v_tc).rgb
									: vec3(1.0);      // white material
						vec3 Ks = vec3(1.0);                   // white specular
						vec3 Ia = vec3(0.1);                   // small ambient

						vec3 color = Ia * Kd        // ambient
						+ diff * Kd       // lambert
						+ spec * Ks;      // specular

						gl_FragColor = vec4(color, 1.0);
						}`;


		this.prog = InitShaderProgram(meshVS, meshFS);

		// attribute locations
		this.a_pos = gl.getAttribLocation(this.prog, 'pos');
		this.a_nrm = gl.getAttribLocation(this.prog, 'normal');
		this.a_tc = gl.getAttribLocation(this.prog, 'texCoord');

		// uniform locations
		this.u_mvp = gl.getUniformLocation(this.prog, 'mvp');
		this.u_mv = gl.getUniformLocation(this.prog, 'mv');
		this.u_nMat = gl.getUniformLocation(this.prog, 'nMat');
		this.u_swapYZ = gl.getUniformLocation(this.prog, 'swapYZ');
		this.u_useTex = gl.getUniformLocation(this.prog, 'useTexture');
		this.u_lightDir = gl.getUniformLocation(this.prog, 'lightDir');
		this.u_shiny = gl.getUniformLocation(this.prog, 'shininess');
		this.u_sampler = gl.getUniformLocation(this.prog, 'tex');

		// GPU resources
		this.posBuff = gl.createBuffer();
		this.nrmBuff = gl.createBuffer();
		this.tcBuff = gl.createBuffer();
		this.texture = gl.createTexture();

		// defaults
		gl.useProgram(this.prog);
		gl.uniform1i(this.u_swapYZ, 0);
		gl.uniform1i(this.u_useTex, 0);
		gl.uniform1f(this.u_shiny, 32.0);
		gl.uniform3f(this.u_lightDir, 0.0, 0.0, 1.0);
		gl.uniform1i(this.u_sampler, 0);

		// 1×1 white fallback texture
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.texImage2D(gl.TEXTURE_2D, 0,
			gl.RGB, 1, 1, 0,
			gl.RGB, gl.UNSIGNED_BYTE,
			new Uint8Array([255, 255, 255]));
		gl.texParameteri(gl.TEXTURE_2D,
			gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D,
			gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		this.numVerts = 0;
		this.hasTC = false;
	}


	/// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh(vertPos, texCoords, normals) {
		// [TO-DO] Update the contents of the vertex buffer objects.
		// positions
		gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuff);
		gl.bufferData(gl.ARRAY_BUFFER,
			new Float32Array(vertPos), gl.STATIC_DRAW);

		// normals
		gl.bindBuffer(gl.ARRAY_BUFFER, this.nrmBuff);
		gl.bufferData(gl.ARRAY_BUFFER,
			new Float32Array(normals), gl.STATIC_DRAW);

		// tex-coords (may be empty)
		this.hasTC = texCoords && texCoords.length;
		if (this.hasTC) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.tcBuff);
			gl.bufferData(gl.ARRAY_BUFFER,
				new Float32Array(texCoords), gl.STATIC_DRAW);
		}

		this.numVerts = vertPos.length / 3;
	}


	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ(swap) {
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
		gl.useProgram(this.prog);
		gl.uniform1i(this.u_swapYZ, swap ? 1 : 0);
	}


	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw(matrixMVP, matrixMV, matrixNormal) {
		// [TO-DO] Complete the WebGL initializations before drawing

		if (!this.numVerts) return;

		gl.useProgram(this.prog);

		// uniforms
		gl.uniformMatrix4fv(this.u_mvp, false, matrixMVP);
		gl.uniformMatrix4fv(this.u_mv, false, matrixMV);
		gl.uniformMatrix3fv(this.u_nMat, false, matrixNormal);

		// vertex attributes
		gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuff);
		gl.vertexAttribPointer(this.a_pos, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.a_pos);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.nrmBuff);
		gl.vertexAttribPointer(this.a_nrm, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.a_nrm);

		if (this.hasTC) {
			gl.bindBuffer(gl.ARRAY_BUFFER, this.tcBuff);
			gl.vertexAttribPointer(this.a_tc, 2, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(this.a_tc);
		} else {
			gl.disableVertexAttribArray(this.a_tc);
		}

		// texture
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		// draw
		gl.drawArrays(gl.TRIANGLES, 0, this.numVerts);
	}


	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture(img) {
		// [TO-DO] Bind the texture
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		// You can set the texture image data using the following command.
		gl.texImage2D(gl.TEXTURE_2D, 0,
			gl.RGB, gl.RGB,
			gl.UNSIGNED_BYTE, img);
		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.useProgram(this.prog);
		gl.uniform1i(this.u_useTex, 1);
	}


	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture(show) {
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		gl.useProgram(this.prog);
		gl.uniform1i(this.u_useTex, show ? 1 : 0);
	}


	// This method is called to set the incoming light direction
	setLightDir(x, y, z) {
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
		gl.useProgram(this.prog);
		gl.uniform3f(this.u_lightDir, x, y, z);
	}


	// This method is called to set the shininess of the material
	setShininess(shininess) {
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.
		gl.useProgram(this.prog);
		gl.uniform1f(this.u_shiny, shininess);
	}
}
