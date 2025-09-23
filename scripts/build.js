const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting GLM AI Config build process...');

// Clean previous builds
console.log('🧹 Cleaning previous builds...');
if (fs.existsSync('build')) {
  fs.rmSync('build', { recursive: true, force: true });
}
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

try {
  // Build React app
  console.log('⚛️  Building React application...');
  execSync('react-scripts build', { stdio: 'inherit' });

  // Verify build
  if (!fs.existsSync('build/index.html')) {
    throw new Error('React build failed - index.html not found');
  }

  console.log('✅ React build completed successfully');

  // Build Electron app
  console.log('🔧 Building Electron application...');
  execSync('electron-builder', { stdio: 'inherit' });

  console.log('🎉 Build process completed successfully!');
  console.log('📦 Check the dist/ folder for the built application');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}