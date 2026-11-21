# Automation Assessment

Work out which tasks to automate first. Built for a small manufacturer holding a list of jobs and no obvious place to start.

[Open the tool](https://cykim5.github.io/automation-assessment/)

## Why

Robot deployments rarely fail on capability. They fail on task choice. Someone picks a job that looked easy and was not, or one that worked and never paid back.

So the first question is not which robot. It is which task. This tool answers that before you talk to a vendor.

## How it works

List your tasks and rate each one. Every task gets two scores.

**Feasibility: can a robot do this today?** The average of three ratings from 1 to 5.

| | Scores low | Scores high |
| --- | --- | --- |
| Action | fine dexterity | simple pick and place |
| Object | soft and varied | rigid and uniform |
| Environment | cluttered and shared | a fixed cell |

**Business fit: is it worth doing?** 60 percent financial return, 40 percent strategic value.

Financial return comes from payback time, which is system cost divided by yearly labor savings. Strategic value covers what money does not measure. A role you cannot hire for. A safety risk you want engineered out.

Both scores run 1 to 5. A task above 3.5 on an axis counts as high, which puts every task in one of four groups.

| | Low business fit | High business fit |
| --- | --- | --- |
| **High feasibility** | easy, low value | **quick wins**, start here |
| **Low feasibility** | deprioritize | strategic bets |

## What it does not do

Payback assumes the robot covers every listed hour from day one. Real deployments ramp up slowly, so treat the payback figure as the best case.

The ratings are judgment calls. This is a first screen before an on-site assessment, not the assessment itself.

The example tasks and costs are illustrative. They are not client data.

## Run it

Plain HTML, CSS and JavaScript. No build step, no dependencies. Open `index.html` in a browser.
