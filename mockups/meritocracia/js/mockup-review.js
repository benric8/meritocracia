(function () {
  'use strict';

  var FICHA_FILE = '04-ficha-valoracion.html';

  var FICHA_DEPRECATED = {
    '04-ficha-valoracion-steps.html': true,
    '04-ficha-valoracion-ux.html': true,
    '04-ficha-valoracion-ux-wide.html': true
  };

  var FLOWS = {
    admin: {
      label: 'Flujo Administrador',
      steps: [
        { file: '01-login.html', title: 'Inicio de sesión' },
        { file: '02-dashboard.html', title: 'Página de inicio' },
        { file: '03-gestion-usuarios.html', title: 'Gestión de usuarios' },
        { file: '07-admin-asignacion.html', title: 'Asignación de carpetas' },
        { file: '07-admin-fecha-valoracion.html', title: 'Fecha de valoración' },
        { file: '06-reportes.html', title: 'Gráficos de valoración' },
        { file: '06-reportes-anexo1.html', title: 'Antigüedad de jueces supremos' },
        { file: '06-reportes-anexo2.html', title: 'Méritos de jueces superiores' },
        { file: '06-reportes-anexo3.html', title: 'Antigüedad de jueces superiores' }
      ]
    },
    registrador: {
      label: 'Flujo Registrador',
      steps: [
        { file: '01-login.html', title: 'Inicio de sesión' },
        { file: '02-dashboard-registrador.html', title: 'Página de inicio' },
        { file: '06-reportes-anexo4.html', title: 'Ficha de valoración (PDF)' },
        { file: '06-reportes-anexo5.html', title: 'Carpeta personal (PDF)' }
      ]
    },
    reportes: {
      label: 'Módulo Reportes',
      steps: [
        { file: '06-reportes.html', title: 'Gráficos de valoración' },
        { file: '06-reportes-anexo1.html', title: 'Antigüedad de jueces supremos' },
        { file: '06-reportes-anexo2.html', title: 'Méritos de jueces superiores' },
        { file: '06-reportes-anexo3.html', title: 'Antigüedad de jueces superiores' },
        { file: '06-reportes-anexo4.html', title: 'Ficha de valoración (PDF)' },
        { file: '06-reportes-anexo5.html', title: 'Carpeta personal (PDF)' }
      ]
    },
    ficha: {
      label: 'Registro de ficha',
      steps: [
        { file: '05-consulta-meritos.html', title: 'Buscar juez' },
        { file: FICHA_FILE, title: 'Ficha de valoración' },
        { file: '08-modal-grado-academico.html', title: 'Modal rubro académico' }
      ]
    }
  };

  var FILE_DEFAULT_FLOW = {
    '02-dashboard.html': 'admin',
    '02-dashboard-registrador.html': 'registrador',
    '03-gestion-usuarios.html': 'admin',
    '07-admin-asignacion.html': 'admin',
    '07-admin-fecha-valoracion.html': 'admin',
    '05-consulta-meritos.html': 'ficha',
    '06-reportes.html': 'reportes',
    '06-reportes-anexo1.html': 'reportes',
    '06-reportes-anexo2.html': 'reportes',
    '06-reportes-anexo3.html': 'reportes',
    '06-reportes-anexo4.html': 'reportes',
    '06-reportes-anexo5.html': 'reportes',
    '04-ficha-valoracion.html': 'ficha',
    '08-modal-grado-academico.html': 'ficha'
  };

  var LOGIN_REDIRECT = {
    admin: '02-dashboard.html',
    registrador: '02-dashboard-registrador.html',
    reportes: '06-reportes.html',
    ficha: '05-consulta-meritos.html'
  };

  var USER_HINTS = {
    '01-login.html': 'Ingrese cualquier usuario y contraseña, luego pulse Iniciar para continuar el recorrido.',
    '02-dashboard.html': 'Revise el resumen institucional, las estadísticas y la carga de resoluciones PDF. Expanda Reportes en el menú lateral para ver los submenús.',
    '02-dashboard-registrador.html': 'Descargue resoluciones publicadas y acceda a los reportes desde el menú lateral.',
    '03-gestion-usuarios.html': 'Consulte la lista de usuarios. Pulse Crear usuario para abrir el formulario con nombres, código, función, cargo y dependencia.',
    '07-admin-asignacion.html': 'Asigne registradores a las carpetas personales de méritos de cada juez.',
    '07-admin-fecha-valoracion.html': 'Consulte la fecha vigente y use Nueva fecha de valoración para registrar un cambio conservando el historial.',
    '05-consulta-meritos.html': 'Busque fichas por DNI, apellidos o nombres y acceda a editar o actualizar el registro.',
    '06-reportes.html': 'Cambie de pestaña y use Descargar PDF en la esquina superior derecha de cada consulta activa.',
    '06-reportes-anexo1.html': 'Revise el cuadro completo de antigüedad. Pulse Generar PDF o Excel para simular la descarga.',
    '06-reportes-anexo2.html': 'Revise el cuadro de méritos por rubros. Pulse Generar PDF o Excel para simular la descarga.',
    '06-reportes-anexo3.html': 'Revise el cuadro de antigüedad de superiores. Pulse Generar PDF o Excel para simular la descarga.',
    '06-reportes-anexo4.html': 'Busque un juez (o use Probar con ejemplo), confirme los datos y genere el reporte en PDF.',
    '06-reportes-anexo5.html': 'Busque un juez (o use Probar con ejemplo), confirme los datos y genere el reporte en PDF.',
    '04-ficha-valoracion.html': 'Complete los rubros de valoración. En Antigüedad (B), use Añadir provisionalidad para registrar cada periodo del 2.º criterio de desempate.',
    '08-modal-grado-academico.html': 'Ejemplo del formulario modal para registrar grados académicos en el rubro C.'
  };

  var REPORT_FILES = {
    '06-reportes.html': true,
    '06-reportes-anexo1.html': true,
    '06-reportes-anexo2.html': true,
    '06-reportes-anexo3.html': true,
    '06-reportes-anexo4.html': true,
    '06-reportes-anexo5.html': true
  };

  var currentFile = (location.pathname.split('/').pop() || 'index.html').split('?')[0];

  if (FICHA_DEPRECATED[currentFile]) {
    location.replace(FICHA_FILE + location.search + location.hash);
    return;
  }

  if (currentFile === 'index.html') {
    return;
  }

  function getFlowId() {
    var params = new URLSearchParams(location.search);
    var fromUrl = params.get('flow');
    if (fromUrl && FLOWS[fromUrl]) {
      sessionStorage.setItem('mockup-review-flow', fromUrl);
      return fromUrl;
    }
    var stored = sessionStorage.getItem('mockup-review-flow');
    if (stored && FLOWS[stored]) {
      return stored;
    }
    var fromBody = document.body.getAttribute('data-review-flow');
    if (fromBody && FLOWS[fromBody]) {
      return fromBody;
    }
    return FILE_DEFAULT_FLOW[currentFile] || 'admin';
  }

  function getMockupsRoot() {
    var path = location.pathname.replace(/\\/g, '/');
    var markers = ['/mockups/', '/meritocracia/'];
    var i;

    for (i = 0; i < markers.length; i++) {
      var markerIdx = path.indexOf(markers[i]);
      if (markerIdx >= 0) {
        return path.substring(0, markerIdx + markers[i].length);
      }
    }

    var pantallasIdx = path.indexOf('/pantallas/');
    if (pantallasIdx >= 0) {
      return path.substring(0, pantallasIdx + 1);
    }

    if (path === '/' || /\/index\.html$/.test(path)) {
      return path.replace(/index\.html$/, '') || '/';
    }

    return '';
  }

  function assetHref(relativePath) {
    var root = getMockupsRoot();
    if (!root) {
      return '../' + relativePath;
    }
    return root + relativePath;
  }

  function canonicalPage(file) {
    if (FICHA_DEPRECATED[file]) {
      return FICHA_FILE;
    }
    return file;
  }

  function pageHref(file, flowId) {
    var query = '?flow=' + encodeURIComponent(flowId);
    var root = getMockupsRoot();
    var target = canonicalPage(file);
    if (!root) {
      return target + query;
    }
    return root + 'pantallas/' + target + query;
  }

  function indexHref() {
    var root = getMockupsRoot();
    if (!root) {
      return '../index.html';
    }
    return root + 'index.html';
  }

  function flowHref(file, flowId) {
    return pageHref(file, flowId);
  }

  function showToast(message) {
    var toast = document.createElement('div');
    toast.className = 'review-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(function () {
      toast.classList.add('is-visible');
    });
    setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(function () {
        toast.remove();
      }, 300);
    }, 2800);
  }

  function enhanceBanners() {
    document.querySelectorAll('.rf-banner').forEach(function (banner) {
      var strong = banner.querySelector('strong');
      var p = banner.querySelector('p');
      if (!p) {
        return;
      }
      if (USER_HINTS[currentFile]) {
        p.textContent = USER_HINTS[currentFile];
      }
      banner.classList.add('review-hint');
      if (strong) {
        var rfText = strong.textContent.trim();
        strong.remove();
        if (rfText) {
          var details = document.createElement('details');
          details.className = 'review-rf-detail';
          details.innerHTML = '<summary>Referencia del requerimiento</summary><span>' + rfText + '</span>';
          banner.appendChild(details);
        }
      }
      var title = document.createElement('strong');
      title.className = 'review-hint-title';
      title.textContent = '¿Qué puede hacer en esta pantalla?';
      banner.insertBefore(title, p);
    });
  }

  function enhanceLoginCallout() {
    if (currentFile !== '01-login.html') {
      return;
    }
    var card = document.querySelector('.login-card-subtitle');
    if (!card) {
      return;
    }
    var callout = document.createElement('p');
    callout.className = 'review-login-callout';
    callout.textContent = 'Mockup interactivo: pulse Iniciar para continuar el recorrido seleccionado en el índice.';
    card.insertAdjacentElement('afterend', callout);
  }

  function expandSidebarForContext(flowId) {
    var onReportPage = !!REPORT_FILES[currentFile];
    var reportFlow = flowId === 'reportes' || flowId === 'admin' || flowId === 'registrador';

    document.querySelectorAll('.nav-group').forEach(function (group) {
      var label = group.querySelector('.nav-label');
      if (!label) {
        return;
      }
      var text = label.textContent.trim();
      var isReportGroup = text === 'Reportes';
      var hasActiveChild = !!group.querySelector('.nav-sub-item.active');

      if (hasActiveChild || (onReportPage && isReportGroup) || (reportFlow && isReportGroup && onReportPage)) {
        group.classList.remove('is-collapsed');
        group.classList.add('is-open');
        if (onReportPage) {
          group.classList.add('is-active');
        }
      }
    });
  }

  function softenChecklists() {
    document.querySelectorAll('.anexo-checklist').forEach(function (list) {
      list.classList.add('review-checklist');
    });
  }

  var REPORT_NAV = [
    { file: '06-reportes.html', letter: 'a', label: 'Gráficos de rubros de valoración', icon: 'chart-line' },
    { file: '06-reportes-anexo1.html', letter: 'b', label: 'Antigüedad de jueces supremos', icon: 'file-pdf' },
    { file: '06-reportes-anexo2.html', letter: 'c', label: 'Méritos de jueces superiores', icon: 'file-pdf' },
    { file: '06-reportes-anexo3.html', letter: 'd', label: 'Antigüedad de jueces superiores', icon: 'file-pdf' },
    { file: '06-reportes-anexo4.html', letter: 'e', label: 'Ficha de valoración de méritos', icon: 'file-edit' },
    { file: '06-reportes-anexo5.html', letter: 'f', label: 'Carpeta personal de méritos', icon: 'folder' }
  ];

  function reportSubmenuHtml(activeFile, openGroup) {
    var groupCls = openGroup ? 'nav-group is-open is-active' : 'nav-group is-collapsed';
    var html = '<div class="' + groupCls + '">';
    html += '<div class="nav-group-head"><img class="icon-img" src="' + assetHref('assets/icons/chart-bar.svg') + '" width="20" height="20" alt="" /><span class="nav-label">Reportes</span><img class="nav-chevron" src="' + assetHref('assets/icons/chevron-down.svg') + '" width="16" height="16" alt="" /></div>';
    html += '<nav class="nav-submenu" aria-label="Reportes">';
    REPORT_NAV.forEach(function (item) {
      var active = item.file === activeFile ? ' active' : '';
      html += '<a class="nav-sub-item' + active + '" href="' + item.file + '"><img class="nav-sub-icon" src="' + assetHref('assets/icons/' + item.icon + '.svg') + '" width="16" height="16" alt="" /><span class="nav-sub-label">' + item.letter + ' — ' + item.label + '</span></a>';
    });
    html += '</nav></div>';
    return html;
  }

  function registradorSidebarHtml(activeFile, carpetaActive) {
    var carpetaCls = carpetaActive ? 'nav-group is-open is-active' : 'nav-group is-collapsed';
    var html = '<aside class="sidebar" data-profile="registrador">';
    html += '<div class="sidebar-profile"><span class="profile-chip profile-chip--reg">Usuario Registrador</span></div>';
    html += '<a class="nav-item" href="02-dashboard-registrador.html"><img class="icon-img" src="' + assetHref('assets/icons/home.svg') + '" width="20" height="20" alt="" /><span class="nav-label">Inicio</span></a>';
    html += '<div class="' + carpetaCls + '">';
    html += '<div class="nav-group-head"><img class="icon-img" src="' + assetHref('assets/icons/folder.svg') + '" width="20" height="20" alt="" /><span class="nav-label">Gestión de la Carpeta Personal de Méritos</span><img class="nav-chevron" src="' + assetHref('assets/icons/chevron-down.svg') + '" width="16" height="16" alt="" /></div>';
    html += '<nav class="nav-submenu" aria-label="Carpeta Personal de Méritos">';
    html += '<a class="nav-sub-item' + (carpetaActive === 'nuevo' ? ' active' : '') + '" href="' + FICHA_FILE + '"><img class="nav-sub-icon" src="' + assetHref('assets/icons/file-edit.svg') + '" width="16" height="16" alt="" /><span class="nav-sub-label">Nuevo registro</span></a>';
    html += '<a class="nav-sub-item' + (carpetaActive === 'consulta' ? ' active' : '') + '" href="05-consulta-meritos.html"><img class="nav-sub-icon" src="' + assetHref('assets/icons/search.svg') + '" width="16" height="16" alt="" /><span class="nav-sub-label">Consulta</span></a>';
    html += '</nav></div>';
    html += reportSubmenuHtml(activeFile, !!activeFile);
    html += '</aside>';
    return html;
  }

  function adminSidebarHtml(activeFile, mainActive, carpetaSubActive) {
    var carpetaOpen = mainActive === 'carpeta' || !!carpetaSubActive;
    var carpetaCls = carpetaOpen ? 'nav-group is-open is-active' : 'nav-group is-collapsed';
    var html = '<aside class="sidebar" data-profile="admin">';
    html += '<div class="sidebar-profile"><span class="profile-chip">Perfil Administrador</span></div>';
    html += '<a class="nav-item' + (mainActive === 'inicio' ? ' active' : '') + '" href="02-dashboard.html"><img class="icon-img" src="' + assetHref('assets/icons/home.svg') + '" width="20" height="20" alt="" /><span class="nav-label">Inicio</span></a>';
    html += '<a class="nav-item' + (mainActive === 'gestion' ? ' active' : '') + '" href="03-gestion-usuarios.html"><img class="icon-img" src="' + assetHref('assets/icons/users.svg') + '" width="20" height="20" alt="" /><span class="nav-label">Gestión de Usuario</span></a>';
    html += '<div class="' + carpetaCls + '">';
    html += '<div class="nav-group-head"><img class="icon-img" src="' + assetHref('assets/icons/folder.svg') + '" width="20" height="20" alt="" /><span class="nav-label">Gestión de la Carpeta Personal de Méritos</span><img class="nav-chevron" src="' + assetHref('assets/icons/chevron-down.svg') + '" width="16" height="16" alt="" /></div>';
    html += '<nav class="nav-submenu" aria-label="Gestión de la Carpeta Personal de Méritos">';
    html += '<a class="nav-sub-item' + (carpetaSubActive === 'asignacion' ? ' active' : '') + '" href="07-admin-asignacion.html"><img class="nav-sub-icon" src="' + assetHref('assets/icons/users.svg') + '" width="16" height="16" alt="" /><span class="nav-sub-label">Asignación</span></a>';
    html += '<a class="nav-sub-item' + (carpetaSubActive === 'fecha' ? ' active' : '') + '" href="07-admin-fecha-valoracion.html"><img class="nav-sub-icon" src="' + assetHref('assets/icons/edit.svg') + '" width="16" height="16" alt="" /><span class="nav-sub-label">Fecha de valoración</span></a>';
    html += '</nav></div>';
    html += reportSubmenuHtml(activeFile, !!activeFile);
    html += '</aside>';
    return html;
  }

  function alignSidebarToProfile(flowId) {
    var sidebar = document.querySelector('.sidebar');
    if (!sidebar) {
      return;
    }

    var isReport = !!REPORT_FILES[currentFile];
    var isAdminReport = isReport && /06-reportes(|-anexo[123]\.html|\.html)/.test(currentFile) && !/anexo[45]/.test(currentFile);
    var useRegistrador = flowId === 'registrador' || flowId === 'ficha';

    if (isAdminReport && useRegistrador) {
      var aside = sidebar;
      var replacement = registradorSidebarHtml(currentFile, null);
      aside.outerHTML = replacement;
      updateHeaderForProfile('registrador');
      return;
    }

    if (isReport && flowId === 'admin' && sidebar.getAttribute('data-profile') === 'registrador' && /anexo[45]/.test(currentFile)) {
      sidebar.outerHTML = adminSidebarHtml(currentFile, 'inicio');
      updateHeaderForProfile('admin');
    }
  }

  function updateHeaderForProfile(profile) {
    var userArea = document.querySelector('.user-area');
    if (!userArea) {
      return;
    }
    if (profile === 'registrador') {
      userArea.innerHTML =
        '<div class="user-info"><strong>Ana Torres Vidal</strong><span>Usuario Registrador · Equipo Cuadro de Méritos</span></div>' +
        '<button class="btn btn-ghost btn-sm">Cambiar contraseña</button>' +
        '<button class="btn btn-ghost btn-sm btn-with-icon"><img src="' + assetHref('assets/icons/logout.svg') + '" width="16" height="16" alt="" /> Cerrar sesión</button>';
    } else if (profile === 'admin') {
      userArea.innerHTML =
        '<div class="user-info"><strong>María López García</strong><span>Analista · Gerencia de RR.HH.</span></div>' +
        '<button class="btn btn-ghost btn-sm">Cambiar contraseña</button>' +
        '<button class="btn btn-ghost btn-sm btn-with-icon"><img src="' + assetHref('assets/icons/logout.svg') + '" width="16" height="16" alt="" /> Cerrar sesión</button>';
    }
  }

  function wireExportButtons() {
    document.querySelectorAll('.btn-with-icon').forEach(function (btn) {
      if (btn.id === 'btn-generar-pdf') {
        return;
      }
      var label = (btn.textContent || '').trim();
      if (/generar pdf|descargar pdf/i.test(label)) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          showToast('PDF generado correctamente (simulación de mockup).');
        });
      }
      if (/generar excel|descargar excel/i.test(label)) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          showToast('Excel generado correctamente (simulación de mockup).');
        });
      }
    });
  }

  function preserveFlowOnLinks(flowId) {
    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href || href.indexOf('http') === 0 || href.indexOf('#') === 0 || href.indexOf('?') >= 0) {
        return;
      }
      if (!/\.html$/i.test(href)) {
        return;
      }
      if (/index\.html$/i.test(href)) {
        link.setAttribute('href', indexHref());
        return;
      }
      var file = canonicalPage(href.split('/').pop());
      link.setAttribute('href', pageHref(file, flowId));
    });
  }

  function wireLogout(flowId) {
    document.querySelectorAll('button').forEach(function (btn) {
      if ((btn.textContent || '').indexOf('Cerrar sesión') === -1) {
        return;
      }
      btn.addEventListener('click', function () {
        location.href = flowHref('01-login.html', flowId);
      });
    });
  }

  function wireSidebarToggle() {
    document.querySelectorAll('.nav-group-head').forEach(function (head) {
      head.addEventListener('click', function () {
        var group = head.closest('.nav-group');
        if (!group) {
          return;
        }
        group.classList.toggle('is-collapsed');
        group.classList.toggle('is-open');
      });
    });
  }

  function wireJudgeDemo() {
    var demoBtn = document.getElementById('btn-demo-juez');
    if (!demoBtn) {
      return;
    }
    demoBtn.addEventListener('click', function () {
      var dni = document.getElementById('busca-dni');
      var apellidos = document.getElementById('busca-apellidos');
      var nombres = document.getElementById('busca-nombres');
      var buscar = document.getElementById('btn-buscar-juez');
      if (dni) {
        dni.value = '12345678';
      }
      if (apellidos) {
        apellidos.value = 'ESPINOZA';
      }
      if (nombres) {
        nombres.value = 'RENE EDGAR';
      }
      if (buscar) {
        buscar.click();
      }
    });
  }

  function wireLogin() {
    if (currentFile !== '01-login.html') {
      return;
    }
    var form = document.querySelector('form');
    if (!form) {
      return;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var flowId = getFlowId();
      location.href = flowHref(LOGIN_REDIRECT[flowId] || '02-dashboard.html', flowId);
    });
  }

  function buildReviewBar(flowId) {
    var flow = FLOWS[flowId];
    if (!flow) {
      return;
    }

    var idx = -1;
    flow.steps.forEach(function (step, i) {
      if (step.file === currentFile) {
        idx = i;
      }
    });

    var oldNav = document.querySelector('.mockup-nav-index');
    if (oldNav) {
      oldNav.remove();
    }

    var bar = document.createElement('nav');
    bar.className = 'review-bar';
    bar.setAttribute('aria-label', 'Navegación de revisión');

    var meta = document.createElement('div');
    meta.className = 'review-bar-meta';
    var stepTitle = idx >= 0 ? flow.steps[idx].title : document.title.replace(/\s*\|.*$/, '');
    meta.innerHTML =
      '<span class="review-bar-flow">' + flow.label + '</span>' +
      (idx >= 0
        ? '<span class="review-bar-step">Paso ' + (idx + 1) + ' de ' + flow.steps.length + '</span>'
        : '') +
      '<span class="review-bar-title">' + stepTitle + '</span>';

    var actions = document.createElement('div');
    actions.className = 'review-bar-actions';

    var prev = document.createElement('a');
    prev.className = 'review-bar-btn';
    prev.textContent = '← Anterior';
    if (idx > 0) {
      prev.href = flowHref(flow.steps[idx - 1].file, flowId);
    } else {
      prev.classList.add('is-disabled');
      prev.href = '#';
      prev.addEventListener('click', function (e) {
        e.preventDefault();
      });
    }

    var index = document.createElement('a');
    index.className = 'review-bar-btn review-bar-btn--index';
    index.href = indexHref();
    index.textContent = 'Índice';

    var next = document.createElement('a');
    next.className = 'review-bar-btn review-bar-btn--primary';
    next.textContent = 'Siguiente →';
    if (idx >= 0 && idx < flow.steps.length - 1) {
      next.href = flowHref(flow.steps[idx + 1].file, flowId);
    } else {
      next.classList.add('is-disabled');
      next.href = '#';
      next.addEventListener('click', function (e) {
        e.preventDefault();
      });
    }

    actions.appendChild(prev);
    actions.appendChild(index);
    actions.appendChild(next);
    bar.appendChild(meta);
    bar.appendChild(actions);
    document.body.appendChild(bar);
    document.body.classList.add('has-review-bar');
  }

  function wireProvisionalidadForm() {
    document.querySelectorAll('.btn-add-provisionalidad').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panelId = btn.getAttribute('data-target');
        var panel = panelId ? document.getElementById(panelId) : null;
        if (!panel) {
          return;
        }
        panel.classList.add('is-visible');
        panel.setAttribute('aria-hidden', 'false');
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        var firstField = panel.querySelector('input, select, textarea');
        if (firstField) {
          firstField.focus();
        }
      });
    });

    document.querySelectorAll('.btn-cancel-provisionalidad').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = btn.closest('.provisionalidad-form-panel');
        if (!panel) {
          return;
        }
        panel.classList.remove('is-visible');
        panel.setAttribute('aria-hidden', 'true');
      });
    });
  }

  function wireUniversityCombobox() {
    var combos = document.querySelectorAll('[data-universidad-combobox]');
    if (!combos.length) {
      return;
    }

    var catalog = [
      { id: 'UNI-001', name: 'Universidad Nacional Mayor de San Marcos', alias: 'UNMSM' },
      { id: 'UNI-002', name: 'Pontificia Universidad Católica del Perú', alias: 'PUCP' },
      { id: 'UNI-003', name: 'Universidad de Lima', alias: 'ULIMA' },
      { id: 'UNI-004', name: 'Universidad Nacional de San Agustín', alias: 'UNSA' },
      { id: 'UNI-005', name: 'Universidad Nacional de Trujillo', alias: 'UNT' },
      { id: 'UNI-006', name: 'Universidad Nacional de Ingeniería', alias: 'UNI' }
    ];

    var modal = document.getElementById('modal-nueva-universidad');
    var activeCombo = null;
    var openCombo = null;

    function padId(num) {
      var s = String(num);
      while (s.length < 3) {
        s = '0' + s;
      }
      return s;
    }

    function closeUniversityModal() {
      if (!modal) {
        return;
      }
      modal.classList.add('is-hidden');
      modal.style.display = 'none';
      var nombre = document.getElementById('nueva-univ-nombre');
      var alias = document.getElementById('nueva-univ-alias');
      var pais = document.getElementById('nueva-univ-pais');
      if (nombre) {
        nombre.value = '';
      }
      if (alias) {
        alias.value = '';
      }
      if (pais) {
        pais.value = 'Perú';
      }
      modal.setAttribute('aria-hidden', 'true');
      activeCombo = null;
    }

    function saveNewUniversity() {
      var nombre = document.getElementById('nueva-univ-nombre').value.trim();
      var alias = document.getElementById('nueva-univ-alias').value.trim();
      if (!nombre) {
        showToast('Ingrese el nombre oficial de la universidad.');
        document.getElementById('nueva-univ-nombre').focus();
        return;
      }
      var exists = catalog.some(function (u) {
        return u.name.toLowerCase() === nombre.toLowerCase();
      });
      if (exists) {
        showToast('Esa universidad ya existe en el catálogo.');
        return;
      }
      var item = {
        id: 'UNI-' + padId(catalog.length + 1),
        name: nombre,
        alias: alias
      };
      catalog.push(item);
      if (activeCombo) {
        selectUniversity(activeCombo, item);
      }
      closeUniversityModal();
      showToast('Universidad agregada al catálogo (simulación).');
    }

    function ensureUniversityModal() {
      if (modal) {
        return modal;
      }

      modal = document.createElement('div');
      modal.id = 'modal-nueva-universidad';
      modal.className = 'modal-overlay is-hidden';
      modal.style.display = 'none';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML =
        '<div class="modal modal-universidad">' +
          '<div class="modal-header">' +
            'Agregar universidad al catálogo' +
            '<button type="button" class="modal-close" id="modal-universidad-close" title="Cerrar">' +
              '<img src="' + assetHref('assets/icons/close.svg') + '" width="20" height="20" alt="" />' +
            '</button>' +
          '</div>' +
          '<div class="modal-body">' +
            '<p style="font-size:13px;color:var(--text-muted);margin:0 0 16px;">Registre el nombre oficial para evitar duplicados (ej. no usar abreviaturas distintas para la misma institución).</p>' +
            '<div class="form-group">' +
              '<label for="nueva-univ-nombre">Nombre oficial de la universidad</label>' +
              '<input class="input" id="nueva-univ-nombre" type="text" placeholder="Ej. Universidad Nacional de..." />' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="nueva-univ-alias">Siglas o código (opcional)</label>' +
              '<input class="input" id="nueva-univ-alias" type="text" placeholder="Ej. UNMSM" />' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="nueva-univ-pais">País</label>' +
              '<input class="input" id="nueva-univ-pais" type="text" value="Perú" />' +
            '</div>' +
          '</div>' +
          '<div class="modal-footer" style="display:flex;justify-content:flex-end;gap:10px;padding:16px 24px;border-top:1px solid var(--border);background:#fafafa;">' +
            '<button type="button" class="btn btn-secondary btn-sm" id="modal-universidad-cancel">Cancelar</button>' +
            '<button type="button" class="btn btn-primary btn-sm btn-with-icon" id="modal-universidad-guardar">' +
              '<img src="' + assetHref('assets/icons/save.svg') + '" width="16" height="16" alt="" /> Guardar en catálogo' +
            '</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(modal);

      modal.querySelector('#modal-universidad-close').addEventListener('click', closeUniversityModal);
      modal.querySelector('#modal-universidad-cancel').addEventListener('click', closeUniversityModal);
      modal.querySelector('#modal-universidad-guardar').addEventListener('click', saveNewUniversity);
      modal.addEventListener('click', function (e) {
        if (e.target === modal) {
          closeUniversityModal();
        }
      });

      return modal;
    }

    function openUniversityModal() {
      var m = ensureUniversityModal();
      m.classList.remove('is-hidden');
      m.style.display = 'flex';
      m.setAttribute('aria-hidden', 'false');
    }

    function filterCatalog(query) {
      var q = (query || '').trim().toLowerCase();
      if (!q) {
        return catalog.slice(0, 8);
      }
      return catalog.filter(function (u) {
        return u.name.toLowerCase().indexOf(q) >= 0 ||
          (u.alias && u.alias.toLowerCase().indexOf(q) >= 0);
      });
    }

    function positionDropdown(combo) {
      var input = combo.querySelector('.universidad-combobox-input');
      var dropdown = combo.querySelector('.universidad-combobox-dropdown');
      if (!input || !dropdown) {
        return;
      }
      var rect = input.getBoundingClientRect();
      dropdown.style.top = (rect.bottom + 4) + 'px';
      dropdown.style.left = rect.left + 'px';
      dropdown.style.width = Math.max(rect.width, 280) + 'px';
    }

    function closeDropdown(combo) {
      if (!combo) {
        return;
      }
      var dropdown = combo.querySelector('.universidad-combobox-dropdown');
      var input = combo.querySelector('.universidad-combobox-input');
      if (dropdown) {
        dropdown.classList.add('is-hidden');
      }
      if (input) {
        input.setAttribute('aria-expanded', 'false');
      }
      combo.classList.remove('is-open');
      if (openCombo === combo) {
        openCombo = null;
      }
    }

    function closeAllDropdowns() {
      document.querySelectorAll('[data-universidad-combobox].is-open').forEach(closeDropdown);
    }

    function selectUniversity(combo, item) {
      var input = combo.querySelector('.universidad-combobox-input');
      input.value = item.name;
      input.dataset.universidadId = item.id;
      input.classList.add('is-selected');
      closeDropdown(combo);
    }

    function openDropdown(combo) {
      closeAllDropdowns();
      var dropdown = combo.querySelector('.universidad-combobox-dropdown');
      var input = combo.querySelector('.universidad-combobox-input');
      combo.classList.add('is-open');
      openCombo = combo;
      positionDropdown(combo);
      dropdown.classList.remove('is-hidden');
      input.setAttribute('aria-expanded', 'true');
    }

    function renderDropdown(combo, query) {
      var dropdown = combo.querySelector('.universidad-combobox-dropdown');
      var results = filterCatalog(query);
      var html = '';

      if (results.length === 0) {
        html += '<div class="universidad-combobox-empty">No hay coincidencias en el catálogo.</div>';
      } else {
        results.forEach(function (item) {
          html +=
            '<button type="button" class="universidad-combobox-option" data-id="' + item.id + '">' +
              item.name +
              (item.alias ? '<small>' + item.alias + '</small>' : '') +
            '</button>';
        });
      }

      html += '<button type="button" class="universidad-combobox-add">+ ¿No encuentras tu universidad? Agrégala aquí</button>';
      dropdown.innerHTML = html;

      dropdown.querySelectorAll('.universidad-combobox-option').forEach(function (btn) {
        btn.addEventListener('mousedown', function (e) {
          e.preventDefault();
          e.stopPropagation();
        });
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var id = btn.getAttribute('data-id');
          var item = catalog.filter(function (u) { return u.id === id; })[0];
          if (item) {
            selectUniversity(combo, item);
          }
        });
      });

      var addBtn = dropdown.querySelector('.universidad-combobox-add');
      if (addBtn) {
        addBtn.addEventListener('mousedown', function (e) {
          e.preventDefault();
          e.stopPropagation();
        });
        addBtn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          activeCombo = combo;
          var input = combo.querySelector('.universidad-combobox-input');
          var prefill = input.value.trim();
          closeDropdown(combo);
          openUniversityModal();
          document.getElementById('nueva-univ-nombre').value = prefill;
          document.getElementById('nueva-univ-nombre').focus();
        });
      }
    }

    combos.forEach(function (combo) {
      var input = combo.querySelector('.universidad-combobox-input');
      if (!input) {
        return;
      }

      combo.addEventListener('mousedown', function (e) {
        e.stopPropagation();
      });

      input.addEventListener('focus', function () {
        renderDropdown(combo, input.value);
        openDropdown(combo);
      });

      input.addEventListener('input', function () {
        input.classList.remove('is-selected');
        delete input.dataset.universidadId;
        renderDropdown(combo, input.value);
        openDropdown(combo);
      });

      input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          closeDropdown(combo);
        }
      });
    });

    document.addEventListener('mousedown', function (e) {
      if (e.target.closest('[data-universidad-combobox]') || e.target.closest('#modal-nueva-universidad')) {
        return;
      }
      closeAllDropdowns();
    });

    window.addEventListener('resize', function () {
      if (openCombo) {
        positionDropdown(openCombo);
      }
    });

    window.addEventListener('scroll', function () {
      if (openCombo) {
        positionDropdown(openCombo);
      }
    }, true);
  }

  var flowId = getFlowId();
  enhanceBanners();
  enhanceLoginCallout();
  alignSidebarToProfile(flowId);
  expandSidebarForContext(flowId);
  softenChecklists();
  buildReviewBar(flowId);
  preserveFlowOnLinks(flowId);
  wireExportButtons();
  wireJudgeDemo();
  wireLogin();
  wireLogout(flowId);
  wireSidebarToggle();
  wireProvisionalidadForm();
  wireUniversityCombobox();
})();
