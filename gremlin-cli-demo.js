#!/usr/bin/env node

const readline = require('readline');

// ANSI color codes
const c = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    italic: '\x1b[3m',
    underline: '\x1b[4m',
    green: '\x1b[32m',
    brightGreen: '\x1b[92m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    purple: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
    bgGray: '\x1b[100m',
};

// ASCII Art Banner
const gremlinArt = `${c.brightGreen}         ,           ,
        / \\         / \\
       /   \\       /   \\
      /     \\     /     \\
     (       \\___/       )
      \\   O         O   /
       \\       ^       /
        \\    _____    /
         \\__/     \\__/${c.reset}`;

const logoArt = `${c.brightGreen}${c.bold}  ____ ____  _____ __  __ _     ___ _   _
 / ___|  _ \\| ____|  \\/  | |   |_ _| \\ | |
| |  _| |_) |  _| | |\\/| | |    | ||  \\| |
| |_| |  _ <| |___| |  | | |___ | || |\\  |
 \\____|_| \\_\\_____|_|  |_|_____|___|_| \\_|${c.reset}`;

// Demo scenario data
const endToEndScenario = [
    {
        user: "I want to train a fusion model on the Multiple Myeloma cohort (q225). Check if we have enough patients with RNA and valid 1L Time-on-Treatment.",
        ai: {
            think: "Invoking DataTools.check_cohort_availability('mm_curated_q225', ['rna', '1l_tot'])...",
            response: `
${c.white}Scanning ${c.brightGreen}mm_curated_q225${c.white} (Total: 1,402 pts)...${c.reset}

${c.gray}┌─────────────────┬───────┬─────────┬──────────────────────┐${c.reset}
${c.gray}│${c.dim} Criteria        ${c.gray}│${c.dim} Count ${c.gray}│${c.dim} % Total ${c.gray}│${c.dim} Status               ${c.gray}│${c.reset}
${c.gray}├─────────────────┼───────┼─────────┼──────────────────────┤${c.reset}
${c.gray}│${c.white} Base Cohort     ${c.gray}│${c.white} 1,402 ${c.gray}│${c.white}   100%  ${c.gray}│${c.brightGreen} ✔ Ready              ${c.gray}│${c.reset}
${c.gray}│${c.white} Has RNA         ${c.gray}│${c.white} 1,374 ${c.gray}│${c.white}    98%  ${c.gray}│${c.brightGreen} ✔ Good Coverage      ${c.gray}│${c.reset}
${c.gray}│${c.white} Has 1L TOT      ${c.gray}│${c.white} 1,150 ${c.gray}│${c.white}    82%  ${c.gray}│${c.yellow} ⚠ High Attrition     ${c.gray}│${c.reset}
${c.gray}├─────────────────┼───────┼─────────┼──────────────────────┤${c.reset}
${c.gray}│${c.bold}${c.white} Intersection    ${c.gray}│${c.bold}${c.white} 1,120 ${c.gray}│${c.bold}${c.white}    79%  ${c.gray}│${c.brightGreen} ✔ Valid for Training ${c.gray}│${c.reset}
${c.gray}└─────────────────┴───────┴─────────┴──────────────────────┘${c.reset}

  ${c.gray}${c.italic}> Note: 1L TOT drop-off is due to missing 'end_date' in 'onco_regimen'.${c.reset}

${c.white}${c.bold}Action:${c.reset}${c.white} Create pinned dataset split ${c.purple}mm_fusion_v1${c.white} with these 1,120 patients?${c.reset}`
        }
    },
    {
        user: "Yes, create it.",
        ai: {
            think: "Invoking DataTools.create_cohort_split()... Materializing in Atlas...",
            response: `
${c.brightGreen}✔ Done.${c.reset}
${c.white}Dataset Created: ${c.brightGreen}${c.underline}atlas://datasets/mm_fusion_v1${c.reset}
${c.gray}Pinned to sha256:a8f9e2...${c.reset}`
        }
    },
    {
        user: "Configure a Late Fusion experiment. Use the best frozen RNA encoder from 'v3-experiments', standard Clinical encoder, target 'overall_survival'. Use our new dataset.",
        ai: {
            think: "Querying Atlas Registry... Generating YAML config...",
            response: `
${c.white}Found best upstream RNA encoder: ${c.bold}${c.brightGreen}rn_8f92x${c.reset}${c.white} (C-Index 0.72).${c.reset}
${c.white}Generated config ${c.purple}exp_fusion_mm_os.yaml${c.white}. Diff:${c.reset}

${c.gray}┌──────────────────────────────────────────────────────────────────────────────┐${c.reset}
${c.gray}│${c.dim}  model:                                                                     ${c.gray}│${c.reset}
${c.gray}│${c.dim}    architecture: late_fusion                                                ${c.gray}│${c.reset}
${c.gray}│${c.brightGreen}  + encoders:                                                                ${c.gray}│${c.reset}
${c.gray}│${c.brightGreen}  +   rna: { checkpoint: "atlas://artifacts/rn_8f92x", trainable: false }    ${c.gray}│${c.reset}
${c.gray}│${c.brightGreen}  +   clinical: { checkpoint: "atlas://registry/cl_base_v2" }                ${c.gray}│${c.reset}
${c.gray}│${c.dim}  data:                                                                      ${c.gray}│${c.reset}
${c.gray}│${c.brightGreen}  + dataset: "atlas://datasets/mm_fusion_v1"                                 ${c.gray}│${c.reset}
${c.gray}│${c.dim}    batch_size: 32  ${c.gray}# Tuned for A100-40GB                                    ${c.gray}│${c.reset}
${c.gray}└──────────────────────────────────────────────────────────────────────────────┘${c.reset}

${c.white}Validation Passed. ${c.bold}Execute run? [Y/n]${c.reset}`
        }
    },
    {
        user: "Y",
        ai: {
            think: "Submitting Ray Job to Hypernexus...",
            response: `
${c.white}🚀 Job ${c.purple}job-d92a-fusion${c.white} submitted to Hypernexus (us-central1).${c.reset}

${c.gray}[INFO] Initializing distributed group...${c.reset}
${c.gray}[INFO] Loaded RNA weights (2.3s)${c.reset}
${c.gray}[INFO] Training started. Epoch 0/20...${c.reset}
${c.brightGreen}[SUCCESS] Job completed in 42m 12s.${c.reset}`
        }
    },
    {
        user: "How did it do? Interpret the results.",
        ai: {
            think: "Invoking BenchTools.evaluate_survival()... Analyzing plots...",
            response: `
${c.gray}${c.bold}SCORECARD${c.reset}
${c.gray}┌───────────────┬───────┬─────────────────────────┐${c.reset}
${c.gray}│${c.dim} Metric        ${c.gray}│${c.dim} Value ${c.gray}│${c.dim} vs Baseline             ${c.gray}│${c.reset}
${c.gray}├───────────────┼───────┼─────────────────────────┤${c.reset}
${c.gray}│${c.white} C-Index       ${c.gray}│${c.bold}${c.white} 0.68  ${c.gray}│${c.red} 🔻 -0.04                ${c.gray}│${c.reset}
${c.gray}│${c.white} Hazard Ratio  ${c.gray}│${c.white} 1.45  ${c.gray}│${c.brightGreen} ✔ Significant (p<0.005) ${c.gray}│${c.reset}
${c.gray}└───────────────┴───────┴─────────────────────────┘${c.reset}

${c.yellow}┌─ 🧐 AI Analysis: Anomaly Detected ─────────────────────────────────┐${c.reset}
${c.yellow}│${c.reset}                                                                   ${c.yellow}│${c.reset}
${c.yellow}│${c.white} 1. ${c.bold}Crossing Curves:${c.reset}${c.white} Kaplan-Meier curves cross at t=18 months.   ${c.yellow}│${c.reset}
${c.yellow}│${c.white}    Violates Proportional Hazards.                                 ${c.yellow}│${c.reset}
${c.yellow}│${c.reset}                                                                   ${c.yellow}│${c.reset}
${c.yellow}│${c.white} 2. ${c.bold}Embedding Warning:${c.reset}${c.white} Metadata shows ${c.yellow}nearest_neighbor${c.white}          ${c.yellow}│${c.reset}
${c.yellow}│${c.white}    embeddings. This often causes leakage.                         ${c.yellow}│${c.reset}
${c.yellow}└───────────────────────────────────────────────────────────────────┘${c.reset}

${c.white}${c.bold}Suggestion:${c.reset}${c.white} Run an ${c.bold}ablation study${c.reset}${c.white} (Clinical-Only) to verify signal strength?${c.reset}`
        }
    },
    {
        user: "Yes, run the ablation.",
        ai: {
            think: "Submitting ablation job...",
            response: `
${c.brightGreen}✔ Ablation job submitted: ${c.purple}job-e45b-ablation${c.reset}
${c.gray}Monitoring progress...${c.reset}`
        }
    },
    {
        user: "Check the status of the ablation job.",
        ai: {
            think: "Invoking Hypernexus.get_job('job-e45b-ablation')... Fetching metrics from ofm-bench...",
            response: `
${c.white}Job ${c.purple}job-e45b-ablation${c.white} is ${c.bold}${c.brightGreen}COMPLETE${c.reset}${c.white}.${c.reset}

${c.gray}${c.bold}COMPARISON: Clinical-Only vs Fusion${c.reset}
${c.gray}┌───────────────┬─────────┬───────────────┬─────────────────────┐${c.reset}
${c.gray}│${c.dim} Metric        ${c.gray}│${c.dim} Fusion  ${c.gray}│${c.dim} Clinical-Only ${c.gray}│${c.dim} Delta               ${c.gray}│${c.reset}
${c.gray}├───────────────┼─────────┼───────────────┼─────────────────────┤${c.reset}
${c.gray}│${c.white} C-Index       ${c.gray}│${c.dim} 0.68    ${c.gray}│${c.bold}${c.white} 0.71          ${c.gray}│${c.brightGreen} ▲ +0.03             ${c.gray}│${c.reset}
${c.gray}│${c.white} Hazard Ratio  ${c.gray}│${c.dim} 1.45    ${c.gray}│${c.bold}${c.white} 1.62          ${c.gray}│${c.brightGreen} ▲ Better Separation ${c.gray}│${c.reset}
${c.gray}└───────────────┴─────────┴───────────────┴─────────────────────┘${c.reset}

${c.brightGreen}│${c.reset} ${c.white}${c.bold}Conclusion:${c.reset}${c.white} The Clinical-Only model outperforms the Fusion model.${c.reset}
${c.brightGreen}│${c.reset} ${c.white}This confirms the hypothesis that the RNA modality (or its${c.reset}
${c.brightGreen}│${c.reset} ${c.white}embedding method) was introducing noise to the signal.${c.reset}`
        }
    },
    {
        user: "Okay, deploy the Clinical-Only model to Inferno.",
        ai: {
            think: "Invoking Inferno.deploy_model('job-e45b-ablation')... Configuring KServe...",
            response: `
${c.brightGreen}✔ Deployment Successful.${c.reset}
${c.white}Model: ${c.bold}cl_unimodal_v2${c.reset}
${c.white}Target: ${c.purple}inferno-batch${c.white} namespace${c.reset}

${c.gray}┌────────────────────────────────────────────────────────────────────────┐${c.reset}
${c.gray}│${c.dim} Endpoint: https://inferno-internal.tempus.com/v1/models/mm-clinical-survival ${c.gray}│${c.reset}
${c.gray}│${c.dim} Status: ${c.brightGreen}Healthy (2/2 Replicas)${c.gray}                                      │${c.reset}
${c.gray}└────────────────────────────────────────────────────────────────────────┘${c.reset}`
        }
    }
];

// State
let state = {
    step: 0,
    typedText: '',
    targetText: '',
    isProcessing: false
};

// Helper functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function hideCursor() {
    process.stdout.write('\x1b[?25l');
}

function showCursor() {
    process.stdout.write('\x1b[?25h');
}

function clearLine() {
    process.stdout.write('\r\x1b[K');
}

function printHeader() {
    console.clear();
    console.log(gremlinArt);
    console.log(logoArt);
    console.log(`\n${c.gray}Tempus Gremlin CLI ${c.brightGreen}v2.4${c.reset}`);
    console.log(`${c.white}${c.bold}G${c.reset}${c.dim}ENERATIVE ${c.reset}${c.bold}R${c.reset}${c.dim}ESEARCH ${c.reset}${c.bold}E${c.reset}${c.dim}NGINE FOR ${c.reset}${c.bold}M${c.reset}${c.dim}ACHINE ${c.reset}${c.bold}L${c.reset}${c.dim}EARNING ${c.reset}${c.bold}I${c.reset}${c.dim}NFRASTRUCTURE & ${c.reset}${c.bold}N${c.reset}${c.dim}AVIGATION${c.reset}`);
    console.log(`${c.gray}${'─'.repeat(72)}${c.reset}`);
    console.log(`${c.gray}--- NEW SESSION: END-TO-END DEMO ---${c.reset}\n`);
}

function renderPrompt() {
    clearLine();
    // Only show typed text - no ghost text preview
    process.stdout.write(`${c.brightGreen}gremlin >${c.reset} ${c.white}${state.typedText}${c.reset}`);
}

async function showThinkingAnimation(text) {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;

    return new Promise((resolve) => {
        const interval = setInterval(() => {
            clearLine();
            process.stdout.write(`${c.gray}  ${frames[i]} ${text}${c.reset}`);
            i = (i + 1) % frames.length;
        }, 80);

        setTimeout(() => {
            clearInterval(interval);
            clearLine();
            console.log(`${c.gray}  ${c.brightGreen}[LOG]${c.gray} ${text.replace('...', '')} ... ${c.brightGreen}DONE${c.reset}`);
            resolve();
        }, 1500);
    });
}

async function showTypingResponse(response) {
    const lines = response.split('\n');
    for (const line of lines) {
        // Type out each line with a slight delay
        for (let i = 0; i < line.length; i++) {
            process.stdout.write(line[i]);
            // Faster typing for formatting characters
            if (line[i] === ' ' || line[i] === '│' || line[i] === '─' || line[i] === '┌' || line[i] === '┐' || line[i] === '└' || line[i] === '┘' || line[i] === '├' || line[i] === '┤' || line[i] === '┼') {
                await sleep(1);
            } else {
                await sleep(3);
            }
        }
        console.log();
        await sleep(20);
    }
}

async function processCommand() {
    const scenario = endToEndScenario[state.step];
    if (!scenario) return;

    state.isProcessing = true;

    // Clear the prompt line and move to next line
    clearLine();
    console.log();

    // Show thinking animation
    await showThinkingAnimation(scenario.ai.think);

    // Show AI label
    console.log(`\n${c.purple}${c.bold}GREMLIN${c.reset}`);

    // Type out the response
    await showTypingResponse(scenario.ai.response);

    // Move to next step
    state.step++;
    state.typedText = '';

    if (state.step >= endToEndScenario.length) {
        console.log(`\n${c.gray}[ END OF DEMO SCENARIO ]${c.reset}\n`);
        showCursor();
        process.exit(0);
    }

    state.targetText = endToEndScenario[state.step].user;
    state.isProcessing = false;

    console.log();
    renderPrompt();
}

// Main
async function main() {
    printHeader();
    hideCursor();

    // Initialize first step
    state.targetText = endToEndScenario[0].user;
    state.typedText = '';

    console.log(`${c.dim}Pro Tip: Press ${c.brightGreen}TAB${c.dim} to auto-complete commands, or type any key to advance${c.reset}\n`);

    renderPrompt();

    // Enable raw mode for single keypress handling
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', async (key) => {
        if (state.isProcessing) return;

        // Handle Ctrl+C
        if (key === '\u0003') {
            showCursor();
            console.log('\n');
            process.exit();
        }

        // Handle Tab - complete entire prompt
        if (key === '\t') {
            state.typedText = state.targetText;
            renderPrompt();
            return;
        }

        // Handle Enter - submit if complete, otherwise complete first
        if (key === '\r' || key === '\n') {
            if (state.typedText.length < state.targetText.length) {
                // Auto-complete on enter
                state.typedText = state.targetText;
                renderPrompt();
            } else {
                // Submit
                await processCommand();
            }
            return;
        }

        // Handle Backspace
        if (key === '\x7f' || key === '\b') {
            if (state.typedText.length > 0) {
                state.typedText = state.typedText.slice(0, -1);
                renderPrompt();
            }
            return;
        }

        // Any other key - type next character from target
        if (state.typedText.length < state.targetText.length) {
            state.typedText += state.targetText[state.typedText.length];
            renderPrompt();
        }
    });

    // Cleanup on exit
    process.on('exit', () => {
        showCursor();
    });

    process.on('SIGINT', () => {
        showCursor();
        process.exit();
    });
}

main().catch((err) => {
    showCursor();
    console.error(err);
    process.exit(1);
});
