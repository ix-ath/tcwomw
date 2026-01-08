/**
 * ScriptedEvent System
 *
 * A robust framework for creating scripted sequences like tutorials,
 * cutscenes, story beats, and special events.
 *
 * Features:
 * - Data-driven: Events defined in JSON
 * - Step-based: Sequential or branching execution
 * - Extensible: Easy to add new step types
 * - Pausable: Can wait for player input or conditions
 *
 * Step Types:
 * - dialogue: Show text overlay
 * - page: Play a word/phrase (typing gameplay)
 * - wait: Pause for time or input
 * - award: Give scrap, unlock helper, set flag
 * - overlay: Show custom UI (Pit, shop, etc.)
 * - branch: Conditional jump to another step
 * - goto: Unconditional jump
 * - end: End the sequence
 */

// =============================================================================
// TYPES
// =============================================================================

export type StepType =
  | 'dialogue'
  | 'page'
  | 'wait'
  | 'award'
  | 'overlay'
  | 'branch'
  | 'goto'
  | 'end';

/** Base step interface */
interface BaseStep {
  id: string;
  type: StepType;
  next?: string; // ID of next step (optional, defaults to sequential)
}

/** Show dialogue/text overlay */
export interface DialogueStep extends BaseStep {
  type: 'dialogue';
  text: string;
  speaker?: string; // Optional speaker name
  position?: 'top' | 'center' | 'bottom';
  dismissOn?: 'click' | 'key' | 'auto' | 'any';
  autoDelay?: number; // ms for auto-dismiss
}

/** Play a typing page (word/phrase) */
export interface PageStep extends BaseStep {
  type: 'page';
  text: string;
  theme?: string;
  tags?: string[];
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  // Special flags for tutorial
  forceScramble?: string; // Override letter order (e.g., "OOSP" for "OOPS")
  allowFailure?: boolean; // If true, failure continues sequence instead of retry
  onSuccess?: string; // Step ID to go to on success
  onFailure?: string; // Step ID to go to on failure
}

/** Wait for condition */
export interface WaitStep extends BaseStep {
  type: 'wait';
  duration?: number; // ms (if not set, waits for input)
  waitFor?: 'click' | 'key';
}

/** Award scrap, unlock helper, or set flag */
export interface AwardStep extends BaseStep {
  type: 'award';
  scrap?: number;
  unlockHelper?: string;
  setFlag?: string;
  message?: string; // Optional message to show
}

/** Show overlay UI */
export interface OverlayStep extends BaseStep {
  type: 'overlay';
  overlayType: 'pit' | 'shop' | 'message' | 'achievement';
  title?: string;
  body?: string;
  options?: { label: string; goto: string }[];
  dismissable?: boolean;
}

/** Conditional branch */
export interface BranchStep extends BaseStep {
  type: 'branch';
  condition: BranchCondition;
  ifTrue: string; // Step ID if condition is true
  ifFalse: string; // Step ID if condition is false
}

export type BranchCondition =
  | { type: 'flag'; flag: string }
  | { type: 'helper_unlocked'; helperId: string }
  | { type: 'scrap_gte'; amount: number }
  | { type: 'tutorial_completed' };

/** Unconditional jump */
export interface GotoStep extends BaseStep {
  type: 'goto';
  target: string; // Step ID to jump to
}

/** End the sequence */
export interface EndStep extends BaseStep {
  type: 'end';
  nextScene?: string; // Scene to transition to
  data?: Record<string, unknown>; // Data to pass to next scene
}

/** Union of all step types */
export type ScriptStep =
  | DialogueStep
  | PageStep
  | WaitStep
  | AwardStep
  | OverlayStep
  | BranchStep
  | GotoStep
  | EndStep;

/** Complete script definition */
export interface ScriptDefinition {
  id: string;
  name: string;
  description?: string;
  startStep: string;
  steps: ScriptStep[];
}

// =============================================================================
// SCRIPT RUNNER
// =============================================================================

export interface ScriptContext {
  scene: Phaser.Scene;
  onStepStart?: (step: ScriptStep) => void;
  onStepEnd?: (step: ScriptStep) => void;
  onScriptEnd?: (data?: Record<string, unknown>) => void;
  flags: Map<string, boolean>;
}

export class ScriptRunner {
  private script: ScriptDefinition;
  private context: ScriptContext;
  private stepMap: Map<string, ScriptStep>;
  private currentStep: ScriptStep | null = null;

  constructor(script: ScriptDefinition, context: ScriptContext) {
    this.script = script;
    this.context = context;
    this.stepMap = new Map();

    // Index steps by ID for fast lookup
    for (const step of script.steps) {
      this.stepMap.set(step.id, step);
    }
  }

  /** Start running the script from the beginning */
  start(): void {
    const startStep = this.stepMap.get(this.script.startStep);
    if (!startStep) {
      console.error(`[ScriptRunner] Start step '${this.script.startStep}' not found`);
      return;
    }
    this.executeStep(startStep);
  }

  /** Get current step */
  getCurrentStep(): ScriptStep | null {
    return this.currentStep;
  }

  /** Resume and advance to next step */
  resume(nextStepId?: string): void {
    if (nextStepId) {
      const next = this.stepMap.get(nextStepId);
      if (next) {
        this.executeStep(next);
      }
    } else if (this.currentStep?.next) {
      const next = this.stepMap.get(this.currentStep.next);
      if (next) {
        this.executeStep(next);
      }
    } else {
      // Try sequential next
      this.advanceSequential();
    }
  }

  /** Execute a specific step */
  private executeStep(step: ScriptStep): void {
    this.currentStep = step;
    this.context.onStepStart?.(step);

    console.log(`[ScriptRunner] Executing step: ${step.id} (${step.type})`);

    switch (step.type) {
      case 'dialogue':
        this.handleDialogue(step);
        break;
      case 'page':
        this.handlePage(step);
        break;
      case 'wait':
        this.handleWait(step);
        break;
      case 'award':
        this.handleAward(step);
        break;
      case 'overlay':
        this.handleOverlay(step);
        break;
      case 'branch':
        this.handleBranch(step);
        break;
      case 'goto':
        this.handleGoto(step);
        break;
      case 'end':
        this.handleEnd(step);
        break;
    }
  }

  /** Advance to next sequential step */
  private advanceSequential(): void {
    if (!this.currentStep) return;

    const currentIndex = this.script.steps.findIndex(s => s.id === this.currentStep?.id);
    if (currentIndex >= 0 && currentIndex < this.script.steps.length - 1) {
      const next = this.script.steps[currentIndex + 1];
      this.executeStep(next);
    } else {
      // End of script
      this.context.onScriptEnd?.();
    }
  }

  /** Advance to specific step or next in sequence */
  private advance(nextId?: string): void {
    this.context.onStepEnd?.(this.currentStep!);

    if (nextId) {
      const next = this.stepMap.get(nextId);
      if (next) {
        this.executeStep(next);
        return;
      }
    }

    if (this.currentStep?.next) {
      const next = this.stepMap.get(this.currentStep.next);
      if (next) {
        this.executeStep(next);
        return;
      }
    }

    this.advanceSequential();
  }

  // ===========================================================================
  // STEP HANDLERS
  // Scene handles rendering; runner just waits for resume() calls
  // ===========================================================================

  private handleDialogue(_step: DialogueStep): void {
    // Scene handles rendering the dialogue, calls resume() when dismissed
  }

  private handlePage(_step: PageStep): void {
    // Scene handles the typing gameplay, calls resume() on success/failure
  }

  private handleWait(step: WaitStep): void {
    if (step.duration) {
      this.context.scene.time.delayedCall(step.duration, () => {
        this.advance(step.next);
      });
    }
    // If no duration, scene will call resume() on input
  }

  private handleAward(step: AwardStep): void {
    // Import SaveManager dynamically to avoid circular deps
    import('./SaveManager').then(({ SaveManager }) => {
      if (step.scrap) {
        SaveManager.addScrap(step.scrap);
      }
      if (step.unlockHelper) {
        SaveManager.unlockHelper(step.unlockHelper);
        SaveManager.equipHelper(step.unlockHelper);
      }
      if (step.setFlag) {
        this.context.flags.set(step.setFlag, true);
      }

      // If message, scene handles showing it and calls resume()
      // Otherwise advance immediately
      if (!step.message) {
        this.advance(step.next);
      }
    });
  }

  private handleOverlay(_step: OverlayStep): void {
    // Scene handles rendering the overlay, calls resume() when dismissed
  }

  private handleBranch(step: BranchStep): void {
    const result = this.evaluateCondition(step.condition);
    this.advance(result ? step.ifTrue : step.ifFalse);
  }

  private handleGoto(step: GotoStep): void {
    this.advance(step.target);
  }

  private handleEnd(step: EndStep): void {
    this.context.onStepEnd?.(step);
    this.context.onScriptEnd?.(step.data);

    if (step.nextScene) {
      this.context.scene.scene.start(step.nextScene, step.data);
    }
  }

  /** Evaluate a branch condition */
  private evaluateCondition(condition: BranchCondition): boolean {
    switch (condition.type) {
      case 'flag':
        return this.context.flags.get(condition.flag) ?? false;

      case 'helper_unlocked':
        // Dynamic import
        let result = false;
        import('./SaveManager').then(({ SaveManager }) => {
          result = SaveManager.isHelperUnlocked(condition.helperId);
        });
        return result;

      case 'scrap_gte':
        let scrap = 0;
        import('./SaveManager').then(({ SaveManager }) => {
          scrap = SaveManager.getCubeScrap();
        });
        return scrap >= condition.amount;

      case 'tutorial_completed':
        let completed = false;
        import('./SaveManager').then(({ SaveManager }) => {
          completed = SaveManager.isTutorialCompleted();
        });
        return completed;

      default:
        return false;
    }
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/** Create a simple linear script from an array of steps */
export function createLinearScript(
  id: string,
  name: string,
  steps: Omit<ScriptStep, 'next'>[]
): ScriptDefinition {
  const linkedSteps: ScriptStep[] = steps.map((step, index) => ({
    ...step,
    next: index < steps.length - 1 ? steps[index + 1].id : undefined,
  })) as ScriptStep[];

  return {
    id,
    name,
    startStep: steps[0].id,
    steps: linkedSteps,
  };
}
