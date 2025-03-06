import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";

import { saveSettingsDebounced } from "../../../../script.js";

import { eventSource, event_types, } from "../../../../script.js";

const extensionName = "st-gemini-tools";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const extensionSettings = extension_settings[extensionName];

const TOOLS = {
    SEARCH: 'search',
    STRUCTURED: 'structured',
};
const defaultSettings = {
    geminiToolsEnabled: false,
    geminiCurrentTool: TOOLS.SEARCH,
    geminiPromptStructure: "",
};


async function loadSettings() {
    extension_settings[extensionName] = extension_settings[extensionName] || {};
    if (Object.keys(extension_settings[extensionName]).length === 0) {
        Object.assign(extension_settings[extensionName], defaultSettings);
    }

    $("#gemini_tools_enabled").prop("checked", extension_settings[extensionName].geminiToolsEnabled).trigger("input");
    $('#gemini_current_tool').val(extension_settings[extensionName].geminiCurrentTool);
    $("#gemini_structured_enabled").prop("checked", extension_settings[extensionName].geminiStructuredEnabled).trigger("input");
    $('#prompt_structure').val(extension_settings[extensionName].geminiPromptStructure);
    $('#prompt_structure_container').toggle(extension_settings[extensionName].geminiCurrentTool === TOOLS.STRUCTURED);
    $('#gemini_tools_settings').toggle(geminiToolsEnabled);
}


function onGeminiToolsEnabledInput(event) {
    const value = Boolean($(event.target).prop("checked"));
    extension_settings[extensionName].geminiToolsEnabled = value;
    $('#gemini_tools_settings').toggle(value);
    saveSettingsDebounced();
}
function onGeminiToolSwap(event) {
    const value = String($(event.target).find(':selected').val());
    extension_settings[extensionName].geminiCurrentTool = value;
    $('#prompt_structure_container').toggle(value === TOOLS.STRUCTURED);
    saveSettingsDebounced();
}
function onPromptStructureInput(event) {
    const value = String($(event.target).val());
    extension_settings[extensionName].geminiPromptStructure = value;
    saveSettingsDebounced();
}

jQuery(async () => {
    const settingsHtml = await $.get(`${extensionFolderPath}/settings.html`);
    $("#extensions_settings").append(settingsHtml);
    $("#gemini_tools_enabled").on("input", onGeminiToolsEnabledInput);
    $("#gemini_current_tool").on("change", onGeminiToolSwap);
    $("#prompt_structure").on("input", onPromptStructureInput);
    loadSettings();
});

eventSource.on(event_types.CHAT_COMPLETION_SETTINGS_READY, enableTools);

function enableTools(data)
{
    const { chatCompletionSettings } = SillyTavern.getContext();
    if(extension_settings[extensionName].geminiToolsEnabled && chatCompletionSettings.chat_completion_source === 'makersuite')
    {
        if(extension_settings[extensionName].geminiCurrentTool === TOOLS.SEARCH) data.tools = [{google_search: {},}];
        else if(extension_settings[extensionName].geminiCurrentTool === TOOLS.STRUCTURED)
        {
            data.responseMimeType = "application/json";
            data.responseSchema = JSON.parse(extension_settings[extensionName].geminiPromptStructure);
        }
    }
}
