import { Point2D, QuadPoints } from '../types';

/**
 * Homography and Perspective Transformation helper for 2D Quad Mapping
 */
export class PerspectiveTransform {
  private matrix: number[] = [1, 0, 0, 0, 1, 0, 0, 0, 1]; // 3x3 identity
  private invMatrix: number[] = [1, 0, 0, 0, 1, 0, 0, 0, 1];

  /**
   * Computes the 3x3 Homography Matrix mapping 4 src points (camera screen)
   * to 4 dest points (e.g. normalized piano sheet 0..1 square)
   */
  public computeHomography(src: QuadPoints, dstWidth = 1.0, dstHeight = 1.0): boolean {
    const s0 = src.topLeft;
    const s1 = src.topRight;
    const s2 = src.bottomRight;
    const s3 = src.bottomLeft;

    const d0 = { x: 0, y: 0 };
    const d1 = { x: dstWidth, y: 0 };
    const d2 = { x: dstWidth, y: dstHeight };
    const d3 = { x: 0, y: dstHeight };

    const srcPts = [s0, s1, s2, s3];
    const dstPts = [d0, d1, d2, d3];

    // Build system of 8 equations for 8 parameters (h33 = 1)
    const A: number[][] = [];
    const B: number[] = [];

    for (let i = 0; i < 4; i++) {
      const sx = srcPts[i].x;
      const sy = srcPts[i].y;
      const dx = dstPts[i].x;
      const dy = dstPts[i].y;

      A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
      B.push(dx);

      A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);
      B.push(dy);
    }

    const h = this.solveGaussian(A, B);
    if (!h) return false;

    this.matrix = [...h, 1];
    this.invMatrix = this.invert3x3(this.matrix);
    return true;
  }

  /**
   * Warps a point from Camera space (src) to Piano normalized space (dst 0..1)
   */
  public transformPoint(pt: Point2D): Point2D {
    const h = this.matrix;
    const x = pt.x;
    const y = pt.y;

    const w = h[6] * x + h[7] * y + h[8];
    if (Math.abs(w) < 1e-7) return { x: 0, y: 0 };

    const u = (h[0] * x + h[1] * y + h[2]) / w;
    const v = (h[3] * x + h[4] * y + h[5]) / w;

    return { x: u, y: v };
  }

  /**
   * Unwarps a point from Piano space (dst 0..1) back to Camera space
   */
  public inverseTransformPoint(pt: Point2D): Point2D {
    const h = this.invMatrix;
    const x = pt.x;
    const y = pt.y;

    const w = h[6] * x + h[7] * y + h[8];
    if (Math.abs(w) < 1e-7) return { x: 0, y: 0 };

    const u = (h[0] * x + h[1] * y + h[2]) / w;
    const v = (h[3] * x + h[4] * y + h[5]) / w;

    return { x: u, y: v };
  }

  /**
   * Solves Ax = B using Gaussian Elimination with partial pivoting
   */
  private solveGaussian(A: number[][], B: number[]): number[] | null {
    const n = 8;
    const M: number[][] = A.map((row, i) => [...row, B[i]]);

    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
          maxRow = k;
        }
      }

      // Swap rows
      const temp = M[i];
      M[i] = M[maxRow];
      M[maxRow] = temp;

      if (Math.abs(M[i][i]) < 1e-9) return null;

      // Make pivot 1
      const pivot = M[i][i];
      for (let j = i; j <= n; j++) {
        M[i][j] /= pivot;
      }

      // Eliminate below and above
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = M[k][i];
          for (let j = i; j <= n; j++) {
            M[k][j] -= factor * M[i][j];
          }
        }
      }
    }

    return M.map(row => row[n]);
  }

  /**
   * Inverts a 3x3 Matrix
   */
  private invert3x3(m: number[]): number[] {
    const [a, b, c, d, e, f, g, h, i] = m;
    const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
    if (Math.abs(det) < 1e-9) return [1, 0, 0, 0, 1, 0, 0, 0, 1];

    const invDet = 1 / det;
    return [
      (e * i - f * h) * invDet,
      (c * h - b * i) * invDet,
      (b * f - c * e) * invDet,
      (f * g - d * i) * invDet,
      (a * i - c * g) * invDet,
      (c * d - a * f) * invDet,
      (d * h - e * g) * invDet,
      (b * g - a * h) * invDet,
      (a * e - b * d) * invDet,
    ];
  }
}
