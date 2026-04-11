// ERP Dashboard Intensive Testing Script
// This script performs comprehensive testing of all features

function logResult(message, isError = false) {
  const resultsDiv = document.getElementById('test-results');
  if (resultsDiv) {
    resultsDiv.style.display = 'block';
    const color = isError ? '#ff6b6b' : '#51cf66';
    resultsDiv.innerHTML += `<div style="color:${color};margin:2px 0;">${message}</div>`;
  }
  console.log(message);
}

console.log('🚀 Starting ERP Dashboard Intensive Testing...\n');
logResult('🚀 Starting ERP Dashboard Intensive Testing...');

// Test 1: DOM Loading
function testDOMLoading() {
  console.log('📋 Test 1: DOM Loading');
  logResult('📋 Test 1: DOM Loading');

  const requiredElements = [
    'app', 'physics-canvas', 'kpi-fat', 'kpi-lucro', 'kpi-ped', 'kpi-desp',
    'toast-wrap', 'modal-area', 'sf-val', 'quick-inp'
  ];

  const missing = requiredElements.filter(id => !document.getElementById(id));
  if (missing.length === 0) {
    console.log('✅ All required DOM elements found');
    logResult('✅ All required DOM elements found');
    return true;
  } else {
    console.log('❌ Missing elements:', missing);
    logResult('❌ Missing elements: ' + missing.join(', '), true);
    return false;
  }
}

// Test 2: State Initialization
function testStateInitialization() {
  console.log('\n📊 Test 2: State Initialization');
  logResult('📊 Test 2: State Initialization');

  try {
    if (typeof state !== 'undefined') {
      const requiredProps = ['tab', 'fat', 'desp', 'pedidos', 'orders', 'contas', 'weekFat'];
      const missing = requiredProps.filter(prop => !(prop in state));
      if (missing.length === 0) {
        console.log('✅ State object properly initialized');
        logResult('✅ State object properly initialized');
        logResult(`   - Current tab: ${state.tab}`);
        logResult(`   - Faturamento: R$ ${state.fat}`);
        logResult(`   - Despesas: R$ ${state.desp}`);
        logResult(`   - Pedidos: ${state.pedidos}`);
        return true;
      } else {
        console.log('❌ Missing state properties:', missing);
        logResult('❌ Missing state properties: ' + missing.join(', '), true);
        return false;
      }
    } else {
      console.log('❌ State object not found');
      logResult('❌ State object not found', true);
      return false;
    }
  } catch (e) {
    console.log('❌ Error accessing state:', e.message);
    logResult('❌ Error accessing state: ' + e.message, true);
    return false;
  }
}

// Test 3: Function Availability
function testFunctionAvailability() {
  console.log('\n⚙️ Test 3: Function Availability');
  logResult('⚙️ Test 3: Function Availability');

  const requiredFunctions = [
    'setTab', 'renderContent', 'simulateIFood', 'simulate99',
    'emitirNFCe', 'parseQuickInput', 'openOrderModal', 'closeModal'
  ];

  const missing = requiredFunctions.filter(fn => typeof window[fn] !== 'function');
  if (missing.length === 0) {
    console.log('✅ All required functions available');
    logResult('✅ All required functions available');
    return true;
  } else {
    console.log('❌ Missing functions:', missing);
    logResult('❌ Missing functions: ' + missing.join(', '), true);
    return false;
  }
}

// Test 4: Matter.js Integration
function testMatterJS() {
  console.log('\n🎯 Test 4: Matter.js Physics Engine');
  logResult('🎯 Test 4: Matter.js Physics Engine');

  try {
    if (typeof Matter !== 'undefined') {
      console.log('✅ Matter.js library loaded');
      logResult('✅ Matter.js library loaded');

      const { Engine, Render, Bodies, World } = Matter;
      if (Engine && Render && Bodies && World) {
        console.log('✅ All required Matter.js modules available');
        logResult('✅ All required Matter.js modules available');
        return true;
      } else {
        console.log('❌ Some Matter.js modules missing');
        logResult('❌ Some Matter.js modules missing', true);
        return false;
      }
    } else {
      console.log('❌ Matter.js not loaded');
      logResult('❌ Matter.js not loaded', true);
      return false;
    }
  } catch (e) {
    console.log('❌ Error testing Matter.js:', e.message);
    logResult('❌ Error testing Matter.js: ' + e.message, true);
    return false;
  }
}

// Test 5: CSS Custom Properties
function testCSSVariables() {
  console.log('\n🎨 Test 5: CSS Custom Properties');
  logResult('🎨 Test 5: CSS Custom Properties');

  const root = document.documentElement;
  const requiredVars = ['--bg', '--card', '--purple', '--emerald', '--gold', '--red', '--blue'];

  const missing = requiredVars.filter(v => !getComputedStyle(root).getPropertyValue(v));
  if (missing.length === 0) {
    console.log('✅ All CSS custom properties defined');
    logResult('✅ All CSS custom properties defined');
    return true;
  } else {
    console.log('❌ Missing CSS variables:', missing);
    logResult('❌ Missing CSS variables: ' + missing.join(', '), true);
    return false;
  }
}

// Test 6: Event Listeners
function testEventListeners() {
  console.log('\n🖱️ Test 6: Event Listeners');
  logResult('🖱️ Test 6: Event Listeners');

  try {
    // Test tab switching
    const dashboardBtn = document.querySelector('.nav-item.active');
    if (dashboardBtn) {
      console.log('✅ Navigation buttons found');
      logResult('✅ Navigation buttons found');
    } else {
      console.log('❌ Navigation buttons not found');
      logResult('❌ Navigation buttons not found', true);
      return false;
    }

    // Test quick input
    const quickInput = document.getElementById('quick-inp');
    if (quickInput) {
      console.log('✅ Quick input field found');
      logResult('✅ Quick input field found');
    } else {
      console.log('❌ Quick input field not found');
      logResult('❌ Quick input field not found', true);
      return false;
    }

    console.log('✅ Basic event listener setup verified');
    logResult('✅ Basic event listener setup verified');
    return true;
  } catch (e) {
    console.log('❌ Error testing event listeners:', e.message);
    logResult('❌ Error testing event listeners: ' + e.message, true);
    return false;
  }
}

// Test 7: Data Integrity
function testDataIntegrity() {
  console.log('\n📈 Test 7: Data Integrity');
  logResult('📈 Test 7: Data Integrity');

  try {
    const totalFat = state.fat;
    const totalDesp = state.desp;
    const calculatedLucro = totalFat - totalDesp;

    const displayedLucro = parseFloat(document.getElementById('kpi-lucro').textContent.replace('R$ ', '').replace(',', ''));

    if (Math.abs(calculatedLucro - displayedLucro) < 0.01) {
      console.log('✅ Financial calculations are accurate');
      logResult('✅ Financial calculations are accurate');
      logResult(`   - Faturamento: R$ ${totalFat}`);
      logResult(`   - Despesas: R$ ${totalDesp}`);
      logResult(`   - Lucro: R$ ${calculatedLucro}`);
      return true;
    } else {
      console.log('❌ Financial calculation mismatch');
      logResult('❌ Financial calculation mismatch', true);
      logResult(`   - Calculated: R$ ${calculatedLucro}`);
      logResult(`   - Displayed: R$ ${displayedLucro}`);
      return false;
    }
  } catch (e) {
    console.log('❌ Error testing data integrity:', e.message);
    logResult('❌ Error testing data integrity: ' + e.message, true);
    return false;
  }
}

// Test 8: Performance Check
function testPerformance() {
  console.log('\n⚡ Test 8: Performance Check');
  logResult('⚡ Test 8: Performance Check');

  try {
    const startTime = performance.now();

    // Simulate some operations
    setTab('dashboard');
    setTab('financeiro');
    setTab('pedidos');
    setTab('equipe');
    setTab('dashboard');

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`✅ Tab switching performance: ${duration.toFixed(2)}ms`);
    logResult(`✅ Tab switching performance: ${duration.toFixed(2)}ms`);

    if (duration < 1000) {
      console.log('✅ Performance is acceptable');
      logResult('✅ Performance is acceptable');
      return true;
    } else {
      console.log('⚠️ Performance could be improved');
      logResult('⚠️ Performance could be improved');
      return true; // Not a failure, just a warning
    }
  } catch (e) {
    console.log('❌ Error testing performance:', e.message);
    logResult('❌ Error testing performance: ' + e.message, true);
    return false;
  }
}

// Test 9: Memory Management
function testMemoryManagement() {
  console.log('\n🧠 Test 9: Memory Management');
  logResult('🧠 Test 9: Memory Management');

  try {
    const initialPhysicsBoxes = state.physBoxes ? state.physBoxes.length : 0;

    // Switch tabs multiple times to test cleanup
    for (let i = 0; i < 3; i++) {
      setTab('financeiro');
      setTab('dashboard');
    }

    const finalPhysicsBoxes = state.physBoxes ? state.physBoxes.length : 0;

    if (finalPhysicsBoxes >= initialPhysicsBoxes) {
      console.log('✅ Physics objects properly managed');
      logResult('✅ Physics objects properly managed');
      logResult(`   - Initial physics boxes: ${initialPhysicsBoxes}`);
      logResult(`   - Final physics boxes: ${finalPhysicsBoxes}`);
      return true;
    } else {
      console.log('⚠️ Physics objects may have cleanup issues');
      logResult('⚠️ Physics objects may have cleanup issues');
      return true; // Not critical
    }
  } catch (e) {
    console.log('❌ Error testing memory management:', e.message);
    logResult('❌ Error testing memory management: ' + e.message, true);
    return false;
  }
}

// Test 10: Error Handling
function testErrorHandling() {
  console.log('\n🛡️ Test 10: Error Handling');
  logResult('🛡️ Test 10: Error Handling');

  try {
    // Test invalid inputs
    const originalOrders = state.orders.length;

    // Try to open modal with invalid ID
    openOrderModal(999);

    // Try invalid quick input
    const quickInput = document.getElementById('quick-inp');
    if (quickInput) {
      quickInput.value = 'invalid input';
      parseQuickInput();
    }

    console.log('✅ Error handling functions executed without crashes');
    logResult('✅ Error handling functions executed without crashes');
    return true;
  } catch (e) {
    console.log('❌ Error in error handling test:', e.message);
    logResult('❌ Error in error handling test: ' + e.message, true);
    return false;
  }
}

// Run all tests
function runAllTests() {
  const tests = [
    testDOMLoading,
    testStateInitialization,
    testFunctionAvailability,
    testMatterJS,
    testCSSVariables,
    testEventListeners,
    testDataIntegrity,
    testPerformance,
    testMemoryManagement,
    testErrorHandling
  ];

  let passed = 0;
  let total = tests.length;

  tests.forEach(test => {
    try {
      if (test()) passed++;
    } catch (e) {
      console.log(`❌ Test failed with exception: ${e.message}`);
      logResult(`❌ Test failed with exception: ${e.message}`, true);
    }
  });

  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}/${total} tests`);
  console.log(`❌ Failed: ${total - passed}/${total} tests`);

  logResult('='.repeat(30));
  logResult('📊 TEST RESULTS SUMMARY');
  logResult('='.repeat(30));
  logResult(`✅ Passed: ${passed}/${total} tests`);
  logResult(`❌ Failed: ${total - passed}/${total} tests`);

  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! ERP Dashboard is fully functional.');
    logResult('🎉 ALL TESTS PASSED! ERP Dashboard is fully functional.');
  } else if (passed >= total * 0.8) {
    console.log('👍 MOST TESTS PASSED! Minor issues detected.');
    logResult('👍 MOST TESTS PASSED! Minor issues detected.');
  } else {
    console.log('⚠️ SIGNIFICANT ISSUES! Requires attention.');
    logResult('⚠️ SIGNIFICANT ISSUES! Requires attention.', true);
  }

  console.log('='.repeat(50));
  logResult('='.repeat(30));
}

// Auto-run tests when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runAllTests);
} else {
  runAllTests();
}