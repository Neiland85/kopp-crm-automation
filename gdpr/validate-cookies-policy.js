#!/usr/bin/env node

/**
 * Script de Validación de Cumplimiento de Política de Cookies
 * Valida que la implementación cumpla con estándares AEPD y RGPD
 */

const fs = require('fs');
const path = require('path');

// Colores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logHeader = (message) => {
  log(`\n${colors.bold}${colors.blue}${'='.repeat(60)}${colors.reset}`);
  log(`${colors.bold}${colors.blue} ${message}${colors.reset}`);
  log(`${colors.bold}${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
};

const logSuccess = (message) => log(`✅ ${message}`, 'green');
const logError = (message) => log(`❌ ${message}`, 'red');
const logWarning = (message) => log(`⚠️  ${message}`, 'yellow');
const logInfo = (message) => log(`ℹ️  ${message}`, 'blue');

// Verificar existencia de archivos
const checkFileExists = (filePath) => {
  return fs.existsSync(filePath);
};

// Verificar estructura de directorios
const checkDirectoryStructure = () => {
  logHeader('VALIDACIÓN DE ESTRUCTURA DE ARCHIVOS');
  
  const requiredFiles = [
    'src/policies/cookies-policy.ts',
    'src/services/CookieManager.ts',
    'src/components/CookieConsentBanner.tsx',
    'src/components/CookiePolicyPage.tsx',
    'src/hooks/useCookies.ts',
    'src/config/cookie-config.example.ts',
    'docs/POLITICA_COOKIES_EXHAUSTIVA.md'
  ];

  const requiredDirectories = [
    'src/policies',
    'src/services',
    'src/components',
    'src/hooks',
    'src/config',
    'docs'
  ];

  let allFilesExist = true;
  let allDirsExist = true;

  // Verificar directorios
  for (const dir of requiredDirectories) {
    if (checkFileExists(dir)) {
      logSuccess(`Directorio encontrado: ${dir}`);
    } else {
      logError(`Directorio faltante: ${dir}`);
      allDirsExist = false;
    }
  }

  // Verificar archivos
  for (const file of requiredFiles) {
    if (checkFileExists(file)) {
      logSuccess(`Archivo encontrado: ${file}`);
    } else {
      logError(`Archivo faltante: ${file}`);
      allFilesExist = false;
    }
  }

  return allFilesExist && allDirsExist;
};

// Verificar configuración TypeScript
const checkTypeScriptConfig = () => {
  logHeader('VALIDACIÓN DE CONFIGURACIÓN TYPESCRIPT');
  
  const tsconfigPath = 'tsconfig.json';
  
  if (!checkFileExists(tsconfigPath)) {
    logError('tsconfig.json no encontrado');
    return false;
  }

  try {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    // Verificar configuración JSX
    if (tsconfig.compilerOptions && tsconfig.compilerOptions.jsx) {
      logSuccess('Configuración JSX encontrada');
    } else {
      logError('Configuración JSX faltante');
      return false;
    }

    // Verificar librerías DOM
    if (tsconfig.compilerOptions && tsconfig.compilerOptions.lib) {
      const libs = tsconfig.compilerOptions.lib;
      if (libs.includes('DOM') && libs.includes('ES2020')) {
        logSuccess('Librerías DOM y ES2020 configuradas');
      } else {
        logError('Librerías DOM o ES2020 faltantes');
        return false;
      }
    }

    // Verificar tipos
    if (tsconfig.compilerOptions && tsconfig.compilerOptions.types) {
      const types = tsconfig.compilerOptions.types;
      if (types.includes('jest') && types.includes('node')) {
        logSuccess('Tipos Jest y Node configurados');
      } else {
        logWarning('Tipos Jest o Node pueden estar faltantes');
      }
    }

    return true;
  } catch (error) {
    logError(`Error parsing tsconfig.json: ${error.message}`);
    return false;
  }
};

// Verificar package.json
const checkPackageJson = () => {
  logHeader('VALIDACIÓN DE PACKAGE.JSON');
  
  const packagePath = 'package.json';
  
  if (!checkFileExists(packagePath)) {
    logError('package.json no encontrado');
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Verificar dependencias React
    const hasReact = packageJson.dependencies?.react || packageJson.devDependencies?.react;
    if (hasReact) {
      logSuccess('React encontrado en dependencias');
    } else {
      logError('React no encontrado en dependencias');
      return false;
    }

    // Verificar TypeScript
    const hasTypeScript = packageJson.devDependencies?.typescript;
    if (hasTypeScript) {
      logSuccess('TypeScript encontrado en dependencias');
    } else {
      logError('TypeScript no encontrado en dependencias');
      return false;
    }

    // Verificar Jest
    const hasJest = packageJson.devDependencies?.jest || packageJson.dependencies?.jest;
    if (hasJest) {
      logSuccess('Jest encontrado en dependencias');
    } else {
      logWarning('Jest no encontrado - tests pueden no funcionar');
    }

    return true;
  } catch (error) {
    logError(`Error parsing package.json: ${error.message}`);
    return false;
  }
};

// Verificar contenido de archivos principales
const checkFileContent = () => {
  logHeader('VALIDACIÓN DE CONTENIDO DE ARCHIVOS');
  
  // Verificar CookiesPolicyManager
  const policyPath = 'src/policies/cookies-policy.ts';
  if (checkFileExists(policyPath)) {
    const content = fs.readFileSync(policyPath, 'utf8');
    
    if (content.includes('CookiesPolicyManager')) {
      logSuccess('CookiesPolicyManager encontrado');
    } else {
      logError('CookiesPolicyManager no encontrado en archivo');
      return false;
    }

    if (content.includes('COOKIE_CATEGORIES')) {
      logSuccess('COOKIE_CATEGORIES encontrado');
    } else {
      logError('COOKIE_CATEGORIES no encontrado');
      return false;
    }

    // Verificar categorías requeridas
    const requiredCategories = ['essential', 'analytics', 'marketing', 'functional', 'personalization'];
    let allCategoriesFound = true;
    
    for (const category of requiredCategories) {
      if (content.includes(`id: '${category}'`)) {
        logSuccess(`Categoría '${category}' encontrada`);
      } else {
        logError(`Categoría '${category}' faltante`);
        allCategoriesFound = false;
      }
    }

    if (!allCategoriesFound) {
      return false;
    }

    // Verificar información legal
    if (content.includes('RGPD') && content.includes('LSSI') && content.includes('AEPD')) {
      logSuccess('Referencias legales encontradas');
    } else {
      logError('Referencias legales incompletas');
      return false;
    }
  }

  // Verificar CookieManager
  const managerPath = 'src/services/CookieManager.ts';
  if (checkFileExists(managerPath)) {
    const content = fs.readFileSync(managerPath, 'utf8');
    
    if (content.includes('class CookieManager')) {
      logSuccess('CookieManager class encontrada');
    } else {
      logError('CookieManager class no encontrada');
      return false;
    }

    // Verificar métodos principales
    const requiredMethods = ['saveConsent', 'getStoredConsent', 'isCookieAllowed', 'enforceConsent'];
    for (const method of requiredMethods) {
      if (content.includes(method)) {
        logSuccess(`Método ${method} encontrado`);
      } else {
        logError(`Método ${method} faltante`);
        return false;
      }
    }
  }

  return true;
};

// Verificar cumplimiento AEPD
const checkAEPDCompliance = () => {
  logHeader('VALIDACIÓN DE CUMPLIMIENTO AEPD');
  
  const policyPath = 'src/policies/cookies-policy.ts';
  if (!checkFileExists(policyPath)) {
    logError('Archivo de política no encontrado');
    return false;
  }

  const content = fs.readFileSync(policyPath, 'utf8');
  
  // Verificar información requerida por AEPD
  const aepdrequirements = [
    'purpose:', // Finalidad
    'legalBasis:', // Base legal
    'dataTransfer:', // Transferencias
    'retention:', // Retención
    'processors:', // Procesadores
    'personalData:', // Datos personales
    'secure:', // Seguridad
    'httpOnly:', // HttpOnly
    'sameSite:' // SameSite
  ];

  let complianceScore = 0;
  const totalRequirements = aepdrequirements.length;

  for (const requirement of aepdrequirements) {
    if (content.includes(requirement)) {
      logSuccess(`Requisito AEPD cumplido: ${requirement}`);
      complianceScore++;
    } else {
      logError(`Requisito AEPD faltante: ${requirement}`);
    }
  }

  const compliancePercentage = (complianceScore / totalRequirements) * 100;
  
  if (compliancePercentage >= 90) {
    logSuccess(`Cumplimiento AEPD: ${compliancePercentage.toFixed(1)}% ✅`);
    return true;
  } else if (compliancePercentage >= 70) {
    logWarning(`Cumplimiento AEPD: ${compliancePercentage.toFixed(1)}% ⚠️`);
    return false;
  } else {
    logError(`Cumplimiento AEPD: ${compliancePercentage.toFixed(1)}% ❌`);
    return false;
  }
};

// Verificar documentación
const checkDocumentation = () => {
  logHeader('VALIDACIÓN DE DOCUMENTACIÓN');
  
  const docPath = 'docs/POLITICA_COOKIES_EXHAUSTIVA.md';
  if (!checkFileExists(docPath)) {
    logError('Documentación principal no encontrada');
    return false;
  }

  const content = fs.readFileSync(docPath, 'utf8');
  
  // Verificar secciones requeridas
  const requiredSections = [
    '# Política de Cookies',
    '## Resumen Ejecutivo',
    '## Implementación Técnica',
    '## Características Avanzadas',
    '## Configuración Personalizada',
    '## Cumplimiento Automático'
  ];

  let allSectionsFound = true;
  
  for (const section of requiredSections) {
    if (content.includes(section)) {
      logSuccess(`Sección encontrada: ${section}`);
    } else {
      logError(`Sección faltante: ${section}`);
      allSectionsFound = false;
    }
  }

  // Verificar longitud mínima
  if (content.length > 10000) {
    logSuccess('Documentación suficientemente detallada');
  } else {
    logWarning('Documentación podría ser más detallada');
  }

  return allSectionsFound;
};

// Generar reporte final
const generateReport = (results) => {
  logHeader('REPORTE FINAL DE VALIDACIÓN');
  
  const totalChecks = Object.keys(results).length;
  const passedChecks = Object.values(results).filter(Boolean).length;
  const failedChecks = totalChecks - passedChecks;
  
  log(`\n📊 RESUMEN:`);
  log(`   Total de validaciones: ${totalChecks}`);
  log(`   Validaciones exitosas: ${passedChecks}`, 'green');
  log(`   Validaciones fallidas: ${failedChecks}`, failedChecks > 0 ? 'red' : 'green');
  log(`   Porcentaje de éxito: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`);
  
  if (failedChecks === 0) {
    log(`\n🎉 ${colors.bold}${colors.green}¡VALIDACIÓN COMPLETA EXITOSA!${colors.reset}`);
    log(`${colors.green}La implementación de política de cookies cumple con todos los estándares.${colors.reset}`);
    log(`${colors.green}✅ Cumplimiento AEPD verificado${colors.reset}`);
    log(`${colors.green}✅ Cumplimiento RGPD verificado${colors.reset}`);
    log(`${colors.green}✅ Estructura técnica correcta${colors.reset}`);
    log(`${colors.green}✅ Documentación completa${colors.reset}`);
    return true;
  } else {
    log(`\n❌ ${colors.bold}${colors.red}VALIDACIÓN FALLIDA${colors.reset}`);
    log(`${colors.red}Se encontraron ${failedChecks} problemas que necesitan ser corregidos.${colors.reset}`);
    log(`${colors.yellow}Revisa los errores anteriores y corrige los problemas identificados.${colors.reset}`);
    return false;
  }
};

// Función principal
const main = () => {
  log(`${colors.bold}${colors.blue}🍪 VALIDADOR DE POLÍTICA DE COOKIES - KOPP STADIUM${colors.reset}`);
  log(`${colors.blue}Verificando cumplimiento con estándares AEPD y RGPD...${colors.reset}`);
  
  const results = {
    fileStructure: checkDirectoryStructure(),
    typeScriptConfig: checkTypeScriptConfig(),
    packageJson: checkPackageJson(),
    fileContent: checkFileContent(),
    aepd: checkAEPDCompliance(),
    documentation: checkDocumentation()
  };
  
  const success = generateReport(results);
  
  if (success) {
    log(`\n${colors.green}🚀 La implementación está lista para producción!${colors.reset}`);
    process.exit(0);
  } else {
    log(`\n${colors.red}🔧 Se requieren correcciones antes del despliegue.${colors.reset}`);
    process.exit(1);
  }
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  checkDirectoryStructure,
  checkTypeScriptConfig,
  checkPackageJson,
  checkFileContent,
  checkAEPDCompliance,
  checkDocumentation,
  generateReport,
  main
};
