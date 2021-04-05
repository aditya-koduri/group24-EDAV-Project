library(tidyverse)
library(jsonlite)

raw_data = read.csv("~/project/allegations.csv")

count_by_precinct <- raw_data %>% 
  group_by(precinct) %>% 
  summarise(count = n())

raw_data1 <- raw_data%>%
  mutate(complainant_ethnicity=replace(complainant_ethnicity, complainant_ethnicity=="", "Unknown"))

complainant_ethnicity_by_precinct <- raw_data1 %>% 
  group_by(precinct, complainant_ethnicity) %>% 
  summarise(count=n(), .groups="drop")



complainant_ethnicity_by_precinct1 <- complainant_ethnicity_by_precinct %>% 
pivot_wider(names_from = complainant_ethnicity, values_from = count, values_fill = 0)

write.csv(complainant_ethnicity_by_precinct1 , file = "~/group24-EDAV-Project/barchart.csv", row.names=FALSE)

## Cleaveland Dot Plot

theme_dotplot <- theme_bw(14) +
  theme(axis.text.y = element_text(size = rel(.75)),
        axis.ticks.y = element_blank(),
        axis.title.x = element_text(size = rel(.75)),
        panel.grid.major.x = element_blank(),
        panel.grid.major.y = element_line(size = 0.5),
        panel.grid.minor.x = element_blank())

count_by_rank_incident <- raw_data %>% 
  group_by(rank_incident) %>% 
  summarise(count = n())

count_by_allegation <- raw_data %>% 
  group_by(allegation) %>% 
  summarise(count = n()) %>% 
  arrange(desc(count))

# move row names to a dataframe column        
df <-  swiss %>% tibble::rownames_to_column("Province")

# create the plot
ggplot(slice(count_by_allegation, 1:10), aes(x = count, y = reorder(allegation, count))) +
  geom_point(color = "blue") +
  scale_x_continuous(limits = c(0, 5000)) +
  theme_dotplot +
  xlab("\nannual live births per 1,000 women aged 15-44") +
  ylab("French-speaking provinces\n") +
  ggtitle("Standardized Fertility Measure\nSwitzerland, 1888")


# create the plot
ggplot(slice(count_by_allegation,11:25), aes(x = count, y = reorder(allegation, count))) +
  geom_point(color = "blue") +
  scale_x_continuous(limits = c(0, 1000)) +
  theme_dotplot +
  xlab("\nannual live births per 1,000 women aged 15-44") +
  ylab("French-speaking provinces\n") +
  ggtitle("Standardized Fertility Measure\nSwitzerland, 1888")

ggplot(slice(count_by_allegation,26:60), aes(x = count, y = reorder(allegation, count))) +
  geom_point(color = "blue") +
  scale_x_continuous(limits = c(0, 250)) +
  theme_dotplot +
  xlab("\nannual live births per 1,000 women aged 15-44") +
  ylab("French-speaking provinces\n") +
  ggtitle("Standardized Fertility Measure\nSwitzerland, 1888")

ggplot(slice(count_by_allegation,46:80), aes(x = count, y = reorder(allegation, count))) +
  geom_point(color = "blue") +
  scale_x_continuous(limits = c(0, 100)) +
  theme_dotplot +
  xlab("\nannual live births per 1,000 women aged 15-44") +
  ylab("French-speaking provinces\n") +
  ggtitle("Standardized Fertility Measure\nSwitzerland, 1888")


