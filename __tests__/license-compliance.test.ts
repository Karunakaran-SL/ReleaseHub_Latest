import fs from 'fs';
import path from 'path';

describe('AGPL-3.0 License Compliance', () => {
  it('should have a LICENSE file in root directory', () => {
    const licensePath = path.join(process.cwd(), 'LICENSE');
    expect(fs.existsSync(licensePath)).toBe(true);
    
    const content = fs.readFileSync(licensePath, 'utf-8');
    expect(content).toContain('GNU AFFERO GENERAL PUBLIC LICENSE');
    expect(content).toContain('Version 3, 19 November 2007');
  });

  it('should declare AGPL-3.0-only in package.json', () => {
    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.license).toBe('AGPL-3.0-only');
  });

  it('should include AGPL-3.0 Section 13 source code disclosure in Footer component', () => {
    const footerPath = path.join(process.cwd(), 'src/components/layout/Footer.tsx');
    expect(fs.existsSync(footerPath)).toBe(true);

    const footerContent = fs.readFileSync(footerPath, 'utf-8');
    expect(footerContent).toContain('ReleaseHub is Open Source software licensed under AGPL-3.0.');
    expect(footerContent).toContain('Get Source Code (AGPL-3.0 Section 13)');
    expect(footerContent).toContain('NEXT_PUBLIC_SOURCE_CODE_URL');
  });
});

