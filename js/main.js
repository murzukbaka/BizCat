var $mainSpinner = $('#main-spinner'), $navBar = $('.navbar'), $mainFooter = $('#main-footer'), $mainOverlay = $('#main-overlay'), $mainContainer = $('#main-container'), $mainContainerContent = $('#main-container-content');

// исходные настройки
$(function() {
	PrepareNavBar();
	MaintainPageNameInTheAddress();
	AutoSizeOverlayToMatchContentSize();
});

// назначить всем ссылкам в меню навигации онклик, по которому будет
// запрашиваться содержимое страниц, имеющих такое же имя, какое указано
// в аттрибуте href ссылок
function PrepareNavBar() {
	$('ul.nav a').each(function() {
		if ($(this).attr('href').length > 1) {
			$(this).on('click', function() {
				MaintainPageNameInTheAddress()
			});
		}
	});
}

function GetPageContent(page) {
	RemovePageContent(function() {
		ShowOverlay(true);
		$.post(page, null, function(data) {
			FillPageContent(data);
		});
	});
}

// если в адресе есть явное название страницы (например "#about"),
// то отмечать соответсвующую вкладку в меню навигации и
// запрашивать с сервера содержимое этой страницы.
// флаг refreshPageContent нужен для того, чтобы не обновлять
// содержимое страницы тогда, когда функция вызывается уже ПОСЛЕ обновления
// (иногда она используется только для обновления состояния выбранной вкладки).
function MaintainPageNameInTheAddress(refreshPageContent) {
	// задержка нужна для того, чтобы при переходе по нажатию на вклавдку в меню навигации
	// название страницы (например "#about") успело прописаться в адресной строке
	setTimeout(function() {
		var currentPage = $.trim(window.location.href.slice(window.location.href.indexOf('#')));
		if (currentPage.length > 1) {// 1 -- это длина '#', т.е. без названия страницы
			$('ul.nav li').removeClass('active');
			$('ul.nav li').each(function() {
				// название страницы в адресной строке совпало с названием
				// страницы в адресе ссылки в одной из вкладок меню навигации
				if ($(this).find('a').attr('href') === currentPage) {
					$(this).addClass('active');
					if (refreshPageContent !== false) {
						GetPageContent(currentPage.slice(1) + '.php');
					}
					return false;
				}
			});
		} else if (currentPage.length == 0 || currentPage === '/') {// в адресе вообще нет "#", то есть главная страница
			var $mainPageLink = $('ul.nav li').find('a[href=#main]');
			if ($mainPageLink !== null) {
				$mainPageLink.parent().addClass('active');
				if (refreshPageContent !== false) {
					GetPageContent('main.php');
				}
			}
		}
	}, 100);
}

function RemovePageContent(callback) {
	$mainContainerContent.animate({
		opacity : 0.0,
		marginLeft : "0.0in"
	}, 300, callback());
}

function FillPageContent(data) {
	setTimeout(function() {
		$mainContainer.empty();
		$mainContainerContent = $('<div />').attr('id', 'main-container-content').addClass('container').append(data);
		$mainContainerContent.appendTo($mainContainer);
		ShowOverlay(false);
		MaintainPageNameInTheAddress(false);
		AutoSizeOverlayToMatchContentSize();
	}, 500);
}

function ShowOverlay(show) {
	if (show === true) {
		$mainSpinner.spin(MAIN_SPINNER_OPTIONS);
		$mainOverlay.animate({
			opacity : 0.6
		}, 300, null);
	} else {
		$mainSpinner.spin(false);
		$mainOverlay.animate({
			opacity : 0.0
		}, 300, null);
	}
}

function AutoSizeOverlayToMatchContentSize() {
	$mainOverlay.css('height', $mainContainer.height() + 'px');
}
