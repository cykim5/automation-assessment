# Automation Assessment

A simple tool that helps a small manufacturer decide which tasks to automate with robots first.

## Why

Most robot deployments don't fail because the robot can't work. They fail because someone picked the wrong task: one that looked easy but wasn't, or one that worked but didn't pay back. Before talking to robot vendors, a business needs a shortlist.

## How it works

You list the tasks in your operation and rate each one. Every task gets two scores:

- **Feasibility (can a robot do it today?)** The average of three 1 to 5 ratings:
  - **Action:** how complex the motion is (fine dexterity vs. simple pick and place)
  - **Object:** how predictable the item is (soft and varied vs. rigid and uniform)
  - **Environment:** how controlled the workspace is (cluttered and shared vs. a fixed cell)
- **Business fit (is it worth it?)** 60% financial return and 40% strategic value.
  - Financial return comes from payback time: system cost divided by yearly labor savings.
  - Strategic value covers what money doesn't, like a role you can't hire for or a safety risk.

Tasks then fall into four groups: **quick wins** (good pilots), **strategic bets** (valuable but hard), **easy, low value**, and **deprioritize**.

## Limits

- Payback assumes the robot covers all listed hours. Real deployments usually ramp up slowly.
- The ratings are judgment calls. This is a first screen before an on-site assessment, not a final answer.
- The example tasks and costs are illustrative, not real client data.

## Run it

It's plain HTML, CSS, and JavaScript with no build step. Open `index.html` in a browser.
