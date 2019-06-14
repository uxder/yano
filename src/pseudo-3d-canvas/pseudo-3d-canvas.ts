
import { Camera } from './camera';
import { Mesh } from './Mesh';
import { mathf } from '../mathf/mathf';
import { MatrixIV } from '../mathf/matrixIV';
import { Vector } from '../mathf/vector';
import { domCanvas } from '../dom/dom-canvas';

interface Pseudo3dCanvasConfig {
    canvasElement: HTMLCanvasElement;
}

/**
 * The main renderer for pseudo3dCanvas.
 *
 * Takes various 3d meshes that need to be displayed on the screen
 * and projects them as 2d points.
 *
 * This pseudo3dCanvas particular class, implements the world - view - perspective
 * matrices to achieve pseudo3d.
 *
 *
 * @see http://web.archive.org/web/20131222170415/http:/robertokoci.com/world-view-projection-matrix-unveiled/
 * @see https://www.davrous.com/2013/06/13/tutorial-series-learning-how-to-write-a-3d-soft-engine-from-scratch-in-c-typescript-or-javascript/
 * @see http://www.codinglabs.net/article_world_view_projection_matrix.aspx
 * @see https://solarianprogrammer.com/2013/05/22/opengl-101-matrices-projection-view-model/
 * @see https://www.3dgep.com/understanding-the-view-matrix/
 */
export class Pseudo3dCanvas {

    private canvasElement: HTMLCanvasElement;
    private width: number;
    private height: number;
    private context: CanvasRenderingContext2D;
    public fov: number;
    public near: number;
    public far: number;
    public aspect: number;

    private rotationMatrix: MatrixIV;
    private translationMatrix: MatrixIV;
    private viewMatrix: MatrixIV;
    private worldMatrix: MatrixIV;
    private projectionMatrix: MatrixIV;
    private transformMatrix: MatrixIV;

    constructor(config: Pseudo3dCanvasConfig) {
        console.log('constructed');
        this.canvasElement = config.canvasElement;
        this.context = this.canvasElement.getContext('2d')!;
        this.canvasElement.width = this.canvasElement.offsetWidth;
        this.canvasElement.height = this.canvasElement.offsetHeight;
        this.width = this.canvasElement.offsetWidth;
        this.height = this.canvasElement.offsetHeight;

        this.fov = mathf.degreeToRadian(45);
        this.near = 1;
        this.aspect = this.width / this.height;
        this.far = 10000;

        this.rotationMatrix = MatrixIV.IDENTITY;
        this.translationMatrix = MatrixIV.IDENTITY;
        this.viewMatrix = MatrixIV.IDENTITY;
        this.worldMatrix = MatrixIV.IDENTITY;
        this.transformMatrix = MatrixIV.IDENTITY;
        this.projectionMatrix = MatrixIV.IDENTITY;
    }


    /**
     * The render cycle for the pseudo-3d-canvas.
     *
     * Takes various 3d meshes that need to be displayed on the screen
     * and projects them as 2d points.
     *
     * This takes on a world - view - projection pattern to creates a
     * translation matrix and then applies that to each vector point.
     *
     *
     * Note that this order matters.
     * ```ts
     *
     * var transformMatrix = worldMatrix * viewMatrix * projectionMatrix;
     *
     * ```
     *
     * WorldMatrix = takes object space to world space
     * ViewMatrix = camera matrix - transforms world space to camera space
     * projectionMatrix = near or far angle of view.
     *
     *
     * http://web.archive.org/web/20131222170415/http:/robertokoci.com/world-view-projection-matrix-unveiled/
     *
     * @param camera
     * @param meshes
     */
    render(camera: Camera, meshes: Array<Mesh>): void {
        this.context.clearRect(0, 0, this.width, this.height);

        // Generate the view matrix based on the camera position.
        // TODO, I think we can add camera rotation here.
        this.viewMatrix =
            new MatrixIV().lookAt(camera.position, camera.target, Vector.UP);

        console.log(this.viewMatrix);

        // const mat = new Float32Array(
        //     [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, -0, -0, 10, 1]
        // )
        // this.viewMatrix = MatrixIV.IDENTITY.fromArray(mat);

        // Generate the projection matrix.
        this.projectionMatrix =
            new MatrixIV()
                .perspective(
                    this.fov, this.aspect, this.near, this.far)

        // const mat2 = new Float32Array(
        //     [1.520478108791285, 0, 0, 0, 0, 2.4327649740660564, 0, 0, 0, 0, 1.0101010101010102, 1, 0, 0, -0.010101010101010102, 0]
        // )
        // this.projectionMatrix = MatrixIV.IDENTITY.fromArray(mat2);


        const centerOfScreenTranslationMatrix =
            new MatrixIV().translate(
                new Vector(this.width / 2, this.height / 2));

        meshes.forEach((mesh) => {
            // Create a worldMatrix that will move, rotation this
            // object to the correct location.
            // this.rotationMatrix = new MatrixIV()
            // .ypr(mesh.rotation.y, mesh.rotation.x, mesh.rotation.z)
            //     // .rotateX(mesh.rotation.x)
            //     // .rotateY(mesh.rotation.y)
            //     // .rotateZ(mesh.rotation.z)
            // Adding a rotation matrix here will rotate the whole world.
            this.rotationMatrix = MatrixIV.IDENTITY;
            // Translate the world to the mesh postion.
            this.translationMatrix = new MatrixIV().translate(mesh.position);
            // this.translationMatrix = MatrixIV.IDENTITY;

            // Note that we start with a centerOfScreenTrnaslationMatrix,
            this.worldMatrix =
                // centerOfScreenTranslationMatrix
                this.rotationMatrix
                    // MatrixIV.IDENTITY
                    //     .multiply(this.rotationMatrix)
                    .multiply(this.translationMatrix);

            // this.worldMatrix =
            //     // centerOfScreenTranslationMatrix
            //     this.translationMatrix
            //         // MatrixIV.IDENTITY
            //         //     .multiply(this.rotationMatrix)
            //         .multiply(this.rotationMatrix);

            // const mat4 = new Float32Array(
            //     [
            //         0.5978339822872978,
            //         0,
            //         -0.8016199408837775,
            //         0,
            //         0.642594529622511,
            //         0.5978339822872978,
            //         0.47923564153945697,
            //         0,
            //         0.47923564153945697,
            //         -0.8016199408837775,
            //         0.3574054703774891,
            //         0,
            //         0,
            //         0,
            //         0,
            //         1

            //     ]
            // )
            // this.worldMatrix = MatrixIV.IDENTITY.fromArray(mat4);



            // this.transformMatrix = this.worldMatrix
            //     .multiply(this.viewMatrix).multiply(this.projectionMatrix);
            this.transformMatrix = this.projectionMatrix
                .multiply(this.viewMatrix).multiply(this.worldMatrix);

            // World x View x Projection
            // const mat3 = new Float32Array(
            //     [
            //         0.9684691519886944,
            //         0,
            //         0.7786916954769801,
            //         0.7709047785222103,
            //         -0.9036112871444302,
            //         -1.5495506431819113,
            //         0.4959879932626835,
            //         0.49102811333005664,
            //         0.7465974971194373,
            //         -1.875430143528984,
            //         -0.40980386106224437,
            //         -0.4057058224516219,
            //         0,
            //         0,
            //         10.090909090909092,
            //         10
            //     ]
            // )
            // this.transformMatrix = MatrixIV.IDENTITY.fromArray(mat3);


            // Reverse
            // const vp = this.viewMatrix.multiply(this.projectionMatrix);
            // const mvp = vp.multiply(this.worldMatrix);
            // this.transformMatrix = mvp;

            // this.transformMatrix =
            //     this.projectionMatrix
            //         .multiply(this.viewMatrix)
            //         .multiply(this.worldMatrix);


            // Now we are going to apply the transformMatrix to each
            // vertices point in the mesh effectively projecting 3d into
            // the 2d canvas.
            mesh.vertices.forEach((v: Vector, i: number) => {
                // Locally rotate and translate the position of this vertices.
                let basisMatrix = mesh.basisMatrix.clone();
                basisMatrix
                    // .ypr(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z)
                    .rotateX(mesh.rotation.x)
                    .rotateY(mesh.rotation.y)
                    .rotateZ(mesh.rotation.z)
                // .translate(mesh.position)
                let transformedVector = basisMatrix.multiplyByVector(v.clone());
                // let transformedVector = v.clone();

                // let vector2d = transformedVector.clone()
                //     .transformWithMatrixIV(this.transformMatrix);
                // let vector2d = this.transformMatrix.multiplyByVector(transformedVector);



                let vector2d = transformedVector.transformCoordinates(
                    this.transformMatrix);
                // console.log(vector2d);
                var x = vector2d.x * this.width + this.width / 2.0 >> 0;
                var y = -vector2d.y * this.width + this.height / 2.0 >> 0;
                vector2d = new Vector(x, y);
                // console.log(vector2d);


                // console.log(vector2d);
                // Check if this vector goes out of boundaries in which case,
                // we don't need to draw it.
                if (vector2d.x >= 0 && vector2d.y >= 0 && vector2d.x < this.width
                    && vector2d.y < this.height) {

                    // TODO (uxder): Expand for way to have different rendering methods.
                    domCanvas.setFillColor(this.context, mesh.color);
                    domCanvas.setStrokeColor(this.context, mesh.color);
                    domCanvas.vectorPoint(this.context, vector2d);
                    domCanvas.quickText(this.context, 'v' + i, vector2d.x, vector2d.y - 4);
                }
            })
        })

    }
}