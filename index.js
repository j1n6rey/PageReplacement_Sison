'use strict';

const path = require('path');
const {app, BrowserWindow, Menu} = require('electron');
const {is} = require('electron-util');
const unhandled = require('electron-unhandled');
const debug = require('electron-debug');
const contextMenu = require('electron-context-menu');
const config = require('./config.js');
const menu = require('./menu.js');

unhandled();
debug();
contextMenu();

// Note: Must match `build.appId` in package.json
app.setAppUserModelId('com.jeannegrey.pagereplacement');

let mainWindow;

const createMainWindow = async () => {
	const window_ = new BrowserWindow({
		title: 'Page Replacement',
		fullscreen: true,
		//icon: path.join(__dirname, 'static', 'icon.png')
	});

	window_.on('ready-to-show', () => {
		window_.show();
	});

	window_.on('closed', () => {
		mainWindow = undefined;
	});

	await window_.loadFile(path.join(__dirname, 'index.html'));

	return window_;
};

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
	app.quit();
}

app.on('second-instance', () => {
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}

		mainWindow.show();
	}
});

app.on('window-all-closed', () => {
	if (!is.macos) {
		app.quit();
	}
});

app.on('activate', async () => {
	if (!mainWindow) {
		mainWindow = await createMainWindow();
	}
});

(async () => {
	await app.whenReady();

	Menu.setApplicationMenu(menu);

	mainWindow = await createMainWindow();

})();
