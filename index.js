// The main script for the extension
// The following are examples of some basic extension functionality

//You'll likely need to import extension_settings, getContext, and loadExtensionSettings from extensions.js
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";

//You'll likely need to import some other functions from the main script
import { saveSettingsDebounced } from "../../../../script.js";

import { eventSource, event_types, } from "../../../../script.js";

// Keep track of where your extension is located, name should match repo name
const extensionName = "st-gemini-tools";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const extensionSettings = extension_settings[extensionName];
const defaultSettings = {
    geminiToolsEnabled: false,
};


async function loadSettings() {
    extension_settings[extensionName] = extension_settings[extensionName] || {};
    if (Object.keys(extension_settings[extensionName]).length === 0) {
      Object.assign(extension_settings[extensionName], defaultSettings);
    }

    $("#gemini_tools_enabled").prop("checked", extension_settings[extensionName].geminiToolsEnabled).trigger("input");
  }


function onGeminiToolsEnabledInput(event) {
  const value = Boolean($(event.target).prop("checked"));
  extension_settings[extensionName].geminiToolsEnabled = value;
  saveSettingsDebounced();
}

jQuery(async () => {
  const settingsHtml = await $.get(`${extensionFolderPath}/example.html`);
  $("#extensions_settings").append(settingsHtml);
  $("#gemini_tools_enabled").on("input", onGeminiToolsEnabledInput);
  loadSettings();
});

eventSource.on(event_types.CHAT_COMPLETION_SETTINGS_READY, enableTools);

function enableTools(data)
{
    if(extension_settings[extensionName].geminiToolsEnabled)
    {
    data.tools = [{google_search: {},}];
    }
}
