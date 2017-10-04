import * as path from 'path';

export class PathUtil {
	public static transformPath(filePath: string): string {	
		let regexMatch = filePath.match(`^[^\/]+\/(.*)`);
		let transformedPath = filePath;
		
		if (regexMatch) {
			transformedPath = regexMatch[1];
		}
		
		return transformedPath;
	}
}
